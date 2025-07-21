import { Document } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";
import { UploadOptions } from "./types";
import { DocumentPermissionService } from "./permissionService";
import { DocumentStorageService } from "./storageService";
import { DocumentCreationService } from "./documentCreationService";
import { VersionManagementService } from "./versionManagementService";
import { DocumentMapperService } from "./documentMapper";
import { DocumentDeletionService } from "./documentDeletionService";

/**
 * Unified document upload service that orchestrates all document operations
 */
export class UnifiedDocumentUploadService {
  private static instance: UnifiedDocumentUploadService;
  
  private permissionService: DocumentPermissionService;
  private storageService: DocumentStorageService;
  private creationService: DocumentCreationService;
  private versionService: VersionManagementService;
  private mapperService: DocumentMapperService;
  private deletionService: DocumentDeletionService;
  
  constructor() {
    this.permissionService = new DocumentPermissionService();
    this.storageService = new DocumentStorageService();
    this.creationService = new DocumentCreationService();
    this.versionService = new VersionManagementService();
    this.mapperService = new DocumentMapperService();
    this.deletionService = new DocumentDeletionService();
  }
  
  public static getInstance(): UnifiedDocumentUploadService {
    if (!UnifiedDocumentUploadService.instance) {
      UnifiedDocumentUploadService.instance = new UnifiedDocumentUploadService();
    }
    return UnifiedDocumentUploadService.instance;
  }

  /**
   * Upload a document file to storage and create database records
   */
  async uploadDocument(options: UploadOptions): Promise<Document | null> {
    const { file, dealId, category, userId, documentId, documentName, milestoneId, onProgress } = options;

    try {
      onProgress?.(10);

      // Verify user participation in the deal
      const canUpload = await this.permissionService.checkUserCanUploadToDeal(dealId, userId);
      if (!canUpload) {
        throw new Error("Permission denied: You are not authorized to upload documents to this deal");
      }

      onProgress?.(20);

      // If documentId is provided, add a new version to existing document
      if (documentId) {
        const canAddVersion = await this.permissionService.checkUserCanModifyDocument(documentId, userId);
        if (!canAddVersion) {
          throw new Error("Permission denied: You are not authorized to add versions to this document");
        }
        return await this.addDocumentVersion(file, dealId, documentId, userId, onProgress);
      }

      // Otherwise, create a new document
      return await this.createNewDocument(file, dealId, category, userId, documentName, milestoneId, onProgress);
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
    milestoneId?: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    // Upload file to storage
    const filePath = await this.storageService.uploadFileToStorage(file, dealId, userId);
    onProgress?.(50);

    // Create document and version records
    const { document, version } = await this.creationService.createNewDocument(
      file, dealId, category, userId, filePath, documentName, milestoneId
    );
    onProgress?.(100);

    return this.mapperService.mapToDocument(document, version);
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
    onProgress?.(30);

    // Get next version number
    const { data: versions } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
    onProgress?.(40);

    // Upload new version file
    const filePath = await this.storageService.uploadVersionFile(file, dealId, documentId, nextVersionNumber, userId);
    onProgress?.(60);

    // Create version record
    const { document, version } = await this.versionService.addDocumentVersion(file, documentId, userId, filePath);
    onProgress?.(100);

    return this.mapperService.mapToDocument(document, version);
  }

  /**
   * Create signed URL for document access
   */
  async createSignedUrl(dealId: string, filePath: string, expiresIn: number = 3600): Promise<string | null> {
    return await this.storageService.createSignedUrl(dealId, filePath, expiresIn);
  }

  /**
   * Delete document and its files
   */
  async deleteDocument(documentId: string, dealId: string): Promise<void> {
    return await this.deletionService.deleteDocument(documentId, dealId);
  }
}

// Export singleton instance
export const unifiedDocumentUploadService = UnifiedDocumentUploadService.getInstance();
