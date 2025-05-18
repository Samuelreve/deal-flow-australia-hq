
import { Document, DocumentVersion } from "@/types/deal";
import { documentRetrievalService } from "./documents/documentRetrievalService";
import { documentUploadService } from "./documents/documentUploadService";
import { documentVersionService } from "./documents/documentVersionService";
import { documentDeleteService } from "./documents/documentDeleteService";

/**
 * Main document service that orchestrates operations between specialized services
 */
export const documentService = {
  /**
   * Get all documents for a deal
   */
  async getDocuments(dealId: string): Promise<Document[]> {
    return documentRetrievalService.getDocuments(dealId);
  },

  /**
   * Get all versions for a document
   */
  async getDocumentVersions(dealId: string, documentId: string): Promise<DocumentVersion[]> {
    return documentVersionService.getDocumentVersions(dealId, documentId);
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
    return documentUploadService.uploadDocument(file, category, dealId, userId, documentId);
  },

  /**
   * Add a new version to an existing document
   */
  async addDocumentVersion(
    file: File, 
    dealId: string, 
    documentId: string, 
    userId: string, 
    description: string = ''
  ): Promise<Document> {
    return documentVersionService.addDocumentVersion(file, dealId, documentId, userId, description);
  },

  /**
   * Delete a document
   */
  async deleteDocument(document: Document, dealId: string, userId: string): Promise<boolean> {
    return documentDeleteService.deleteDocument(document, dealId, userId);
  },

  /**
   * Delete a specific version of a document
   */
  async deleteDocumentVersion(
    versionId: string, 
    documentId: string, 
    dealId: string, 
    storagePath: string,
    userId: string
  ): Promise<boolean> {
    return documentVersionService.deleteDocumentVersion(versionId, documentId, dealId, storagePath, userId);
  },
  
  /**
   * Check if user has access to a document
   */
  async verifyDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    return documentRetrievalService.verifyDocumentAccess(documentId, userId);
  }
};
