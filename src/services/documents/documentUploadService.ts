
import { Document } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentStorageService } from "./documentStorageService";
import { documentMapperService } from "./documentMapperService";
import { documentVersionService } from "./documentVersionService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for document upload operations
 */
export const documentUploadService = {
  /**
   * Check if a user can add a version to a document
   */
  async canAddVersionToDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      return await documentDatabaseService.checkUserCanModifyDocument(documentId, userId);
    } catch (error) {
      console.error("Error checking if user can add version to document:", error);
      return false;
    }
  },
  
  /**
   * Upload a document (first version or new version)
   */
  async uploadDocument(
    file: File, 
    category: string, 
    dealId: string, 
    userId: string, 
    documentId?: string
  ): Promise<Document> {
    try {
      // Verify user participation in the deal
      const canUpload = await documentDatabaseService.checkUserCanUploadToDeal(dealId, userId);
      
      if (!canUpload) {
        throw new Error("Permission denied: You are not authorized to upload documents to this deal");
      }
      
      // If documentId is provided, add a new version to an existing document
      if (documentId) {
        // Verify user has permission to add versions to this document
        const canAddVersion = await documentDatabaseService.checkUserCanModifyDocument(documentId, userId);
        
        if (!canAddVersion) {
          throw new Error("Permission denied: You are not authorized to add versions to this document");
        }
        
        return await documentVersionService.addDocumentVersion(file, dealId, documentId, userId);
      }
      
      // Otherwise, create a new document with its first version
      // 1. Upload file to storage
      const filePath = await documentStorageService.uploadFile(file, dealId, userId);
      
      // 2. Save metadata to database
      const documentData = await documentDatabaseService.saveDocumentMetadata({
        deal_id: dealId,
        name: file.name,
        description: '',
        storage_path: filePath,
        uploaded_by: userId,
        size: file.size,
        type: file.type,
        status: "draft",
        version: 1,
        milestone_id: null,
        category
      });
      
      // 3. Create initial version record
      const versionData = await documentDatabaseService.saveDocumentVersion({
        document_id: documentData.id,
        version_number: 1,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: 'Initial version'
      });
      
      // 4. Update document with latest version ID
      await supabase
        .from('documents')
        .update({ latest_version_id: versionData.id })
        .eq('id', documentData.id);
      
      // 5. Map to domain model
      return await documentMapperService.mapToDocument({
        ...documentData,
        latest_version_id: versionData.id
      }, dealId);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }
};
