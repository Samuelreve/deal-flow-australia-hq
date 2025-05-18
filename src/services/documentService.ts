
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
   * Includes RBAC checks for permissions
   */
  async uploadDocument(
    file: File, 
    category: string, 
    dealId: string, 
    userId: string, 
    documentId?: string
  ): Promise<Document> {
    // Verify user has permission to upload documents to this deal
    const accessCheck = await documentRetrievalService.verifyDealDocumentAccess(dealId, userId);
    if (!accessCheck.canAccess) {
      throw new Error("Permission denied: You are not a participant in this deal");
    }
    
    // Verify user's role permits document uploads
    const accessControl = await documentRetrievalService.getDocumentAccessControl(dealId, userId);
    if (!accessControl.canUpload) {
      throw new Error(`Permission denied: Your role (${accessControl.userRole}) cannot upload documents`);
    }
    
    // Verify deal status allows document uploads
    const dealStatusCheck = await documentRetrievalService.checkDealStatusForDocumentOperations(dealId);
    if (!dealStatusCheck.allowsUpload) {
      throw new Error(`Document uploads are not allowed when the deal status is "${dealStatusCheck.dealStatus}"`);
    }
    
    // If adding a version to existing document, verify permission
    if (documentId) {
      const canModifyDocument = await documentUploadService.canAddVersionToDocument(documentId, userId);
      if (!canModifyDocument) {
        throw new Error("Permission denied: You cannot add versions to this document");
      }
    }

    // All checks pass, proceed with upload
    return documentUploadService.uploadDocument(file, category, dealId, userId, documentId);
  },

  /**
   * Add a new version to an existing document
   * Includes RBAC checks
   */
  async addDocumentVersion(
    file: File, 
    dealId: string, 
    documentId: string, 
    userId: string, 
    description: string = ''
  ): Promise<Document> {
    // Verify user has permission to add versions to this document
    const accessControl = await documentRetrievalService.getDocumentAccessControl(dealId, userId);
    if (!accessControl.canAddVersions) {
      throw new Error(`Permission denied: Your role (${accessControl.userRole}) cannot add document versions`);
    }
    
    const canModifyDocument = await documentUploadService.canAddVersionToDocument(documentId, userId);
    if (!canModifyDocument) {
      throw new Error("Permission denied: You cannot add versions to this document");
    }
    
    // Verify deal status allows document modifications
    const dealStatusCheck = await documentRetrievalService.checkDealStatusForDocumentOperations(dealId);
    if (!dealStatusCheck.allowsUpload) {
      throw new Error(`Document updates are not allowed when the deal status is "${dealStatusCheck.dealStatus}"`);
    }
    
    return documentVersionService.addDocumentVersion(file, dealId, documentId, userId, description);
  },

  /**
   * Delete a document
   * Includes RBAC checks
   */
  async deleteDocument(document: Document, dealId: string, userId: string): Promise<boolean> {
    // Verify user has permission to delete documents
    const accessControl = await documentRetrievalService.getDocumentAccessControl(dealId, userId);
    if (!accessControl.canDelete) {
      throw new Error(`Permission denied: Your role (${accessControl.userRole}) cannot delete documents`);
    }
    
    // Check if user is the document uploader or has a role that can delete any document
    const canDeleteDoc = await documentDeleteService.canDeleteDocument(document.id, userId);
    if (!canDeleteDoc) {
      throw new Error("Permission denied: You cannot delete this document");
    }
    
    // Verify deal status allows document deletion
    const dealStatusCheck = await documentRetrievalService.checkDealStatusForDocumentOperations(dealId);
    if (!dealStatusCheck.allowsDelete) {
      throw new Error(`Document deletion is not allowed when the deal status is "${dealStatusCheck.dealStatus}"`);
    }
    
    return documentDeleteService.deleteDocument(document, dealId, userId);
  },

  /**
   * Delete a specific version of a document
   * Includes RBAC checks
   */
  async deleteDocumentVersion(
    versionId: string, 
    documentId: string, 
    dealId: string, 
    storagePath: string,
    userId: string
  ): Promise<boolean> {
    // Verify user has permission to delete document versions
    const accessControl = await documentRetrievalService.getDocumentAccessControl(dealId, userId);
    if (!accessControl.canDelete) {
      throw new Error(`Permission denied: Your role (${accessControl.userRole}) cannot delete document versions`);
    }
    
    // Check if user can delete this specific version
    const canDeleteVersion = await documentVersionService.canDeleteDocumentVersion(versionId, documentId, userId);
    if (!canDeleteVersion) {
      throw new Error("Permission denied: You cannot delete this document version");
    }
    
    // Verify deal status allows document version deletion
    const dealStatusCheck = await documentRetrievalService.checkDealStatusForDocumentOperations(dealId);
    if (!dealStatusCheck.allowsDelete) {
      throw new Error(`Document version deletion is not allowed when the deal status is "${dealStatusCheck.dealStatus}"`);
    }
    
    return documentVersionService.deleteDocumentVersion(versionId, documentId, dealId, storagePath, userId);
  },
  
  /**
   * Check if user has access to a document
   */
  async verifyDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    return documentRetrievalService.verifyDocumentAccess(documentId, userId);
  },
  
  /**
   * Get document access control information for a user
   */
  async getDocumentAccessControl(dealId: string, userId: string) {
    return documentRetrievalService.getDocumentAccessControl(dealId, userId);
  }
};
