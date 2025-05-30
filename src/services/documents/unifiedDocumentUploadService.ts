import { Document } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Unified document upload service that handles all document upload scenarios
 */
export class UnifiedDocumentUploadService {
  private static instance: UnifiedDocumentUploadService;
  
  public static getInstance(): UnifiedDocumentUploadService {
    if (!UnifiedDocumentUploadService.instance) {
      UnifiedDocumentUploadService.instance = new UnifiedDocumentUploadService();
    }
    return UnifiedDocumentUploadService.getInstance();
  }

  /**
   * Upload a document file to storage and create database records
   */
  async uploadDocument(options: {
    file: File;
    dealId: string;
    category: string;
    userId: string;
    documentId?: string; // For adding versions to existing documents
    documentName?: string; // Override document name
    onProgress?: (progress: number) => void;
  }): Promise<Document | null> {
    const { file, dealId, category, userId, documentId, documentName, onProgress } = options;

    try {
      onProgress?.(10);

      // Verify user participation in the deal
      const canUpload = await this.checkUserCanUploadToDeal(dealId, userId);
      if (!canUpload) {
        throw new Error("Permission denied: You are not authorized to upload documents to this deal");
      }

      onProgress?.(20);

      // If documentId is provided, add a new version to existing document
      if (documentId) {
        const canAddVersion = await this.checkUserCanModifyDocument(documentId, userId);
        if (!canAddVersion) {
          throw new Error("Permission denied: You are not authorized to add versions to this document");
        }
        return await this.addDocumentVersion(file, dealId, documentId, userId, onProgress);
      }

      // Otherwise, create a new document
      return await this.createNewDocument(file, dealId, category, userId, documentName, onProgress);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  /**
   * Create a new document with its first version
   */
  private async createNewDocument(
    file: File,
    dealId: string,
    category: string,
    userId: string,
    documentName?: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    // 1. Upload file to storage
    const filePath = await this.uploadFileToStorage(file, dealId, userId);
    onProgress?.(50);

    // 2. Create document record
    const { data: documentData, error: docError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: documentName || file.name,
        description: '',
        storage_path: filePath,
        uploaded_by: userId,
        size: file.size,
        type: file.type,
        status: "draft",
        version: 1,
        milestone_id: null,
        category
      })
      .select()
      .single();

    if (docError) throw docError;
    onProgress?.(70);

    // 3. Create initial version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentData.id,
        version_number: 1,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: 'Initial version'
      })
      .select()
      .single();

    if (versionError) throw versionError;
    onProgress?.(85);

    // 4. Update document with latest version ID
    await supabase
      .from('documents')
      .update({ latest_version_id: versionData.id })
      .eq('id', documentData.id);

    onProgress?.(100);

    // 5. Return mapped document
    return this.mapToDocument(documentData, versionData);
  }

  /**
   * Add a new version to an existing document
   */
  private async addDocumentVersion(
    file: File,
    dealId: string,
    documentId: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    // Get existing document
    const { data: existingDoc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;
    onProgress?.(30);

    // Get next version number
    const { data: versions, error: versionsError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionsError) throw versionsError;

    const nextVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;
    onProgress?.(40);

    // Upload new version file
    const filePath = await this.uploadVersionFile(file, dealId, documentId, nextVersionNumber, userId);
    onProgress?.(60);

    // Create version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersionNumber,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: `Version ${nextVersionNumber}`
      })
      .select()
      .single();

    if (versionError) throw versionError;
    onProgress?.(80);

    // Update document with latest version
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        latest_version_id: versionData.id,
        version: nextVersionNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;
    onProgress?.(100);

    return this.mapToDocument(existingDoc, versionData);
  }

  /**
   * Upload file to storage with unique path
   */
  private async uploadFileToStorage(file: File, dealId: string, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;

    const { error: uploadError } = await supabase.storage
      .from('deal-documents')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    return filePath;
  }

  /**
   * Upload version file to storage
   */
  private async uploadVersionFile(
    file: File,
    dealId: string,
    documentId: string,
    versionNumber: number,
    userId: string
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${documentId}/v${versionNumber}-${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;

    const { error: uploadError } = await supabase.storage
      .from('deal-documents')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload version file: ${uploadError.message}`);
    }

    return filePath;
  }

  /**
   * Check if user can upload to deal
   */
  private async checkUserCanUploadToDeal(dealId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return ['admin', 'seller', 'lawyer'].includes(data.role);
  }

  /**
   * Check if user can modify document
   */
  private async checkUserCanModifyDocument(documentId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('documents')
      .select('uploaded_by, deal_id')
      .eq('id', documentId)
      .single();

    if (error) return false;

    // User is the uploader
    if (data.uploaded_by === userId) return true;

    // Check if user is admin/seller in the deal
    return await this.checkUserCanUploadToDeal(data.deal_id, userId);
  }

  /**
   * Create signed URL for document access
   */
  async createSignedUrl(dealId: string, filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const fullPath = `${dealId}/${filePath}`;
      const { data: urlData, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(fullPath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return urlData?.signedUrl || null;
    } catch (error) {
      console.error('Unexpected error creating signed URL:', error);
      return null;
    }
  }

  /**
   * Delete document and its files
   */
  async deleteDocument(documentId: string, dealId: string): Promise<void> {
    // Get all versions for cleanup
    const { data: versions } = await supabase
      .from('document_versions')
      .select('storage_path')
      .eq('document_id', documentId);

    // Delete files from storage
    if (versions) {
      for (const version of versions) {
        const fullPath = `${dealId}/${version.storage_path}`;
        await supabase.storage
          .from('deal-documents')
          .remove([fullPath]);
      }
    }

    // Delete database records (versions first due to foreign key)
    await supabase
      .from('document_versions')
      .delete()
      .eq('document_id', documentId);

    await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
  }

  /**
   * Map database records to Document type
   */
  private mapToDocument(documentData: any, versionData?: any): Document {
    return {
      id: documentData.id,
      name: documentData.name,
      url: '', // Will be populated with signed URL when needed
      uploadedBy: documentData.uploaded_by,
      uploadedAt: new Date(documentData.created_at),
      size: documentData.size,
      type: documentData.type,
      status: documentData.status || "draft",
      version: documentData.version || 1,
      category: documentData.category,
      latestVersionId: documentData.latest_version_id,
      latestVersion: versionData ? {
        id: versionData.id,
        documentId: versionData.document_id,
        versionNumber: versionData.version_number,
        url: '',
        uploadedBy: versionData.uploaded_by,
        uploadedAt: new Date(versionData.created_at),
        size: versionData.size,
        type: versionData.type,
        description: versionData.description
      } : undefined,
      versions: [],
      comments: []
    };
  }
}

// Export singleton instance
export const unifiedDocumentUploadService = UnifiedDocumentUploadService.getInstance();
