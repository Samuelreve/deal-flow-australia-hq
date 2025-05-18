
import { documentBaseService } from "./database/documentBaseService";
import { documentPermissionService } from "./database/documentPermissionService";
import { documentRetrievalDbService } from "./database/documentRetrievalDbService";
import { documentCreationService } from "./database/documentCreationService";
import { documentDeletionService } from "./database/documentDeletionService";
import { DocumentMetadata, DocumentVersionMetadata } from "./documentDatabaseTypes";

/**
 * Service responsible for database operations related to documents
 * This is a facade that combines all document database services
 */
export const documentDatabaseService = {
  // Re-export types
  DocumentMetadata,
  DocumentVersionMetadata,

  // Re-export methods from base service
  checkUserCanUploadToDeal: documentBaseService.checkUserCanUploadToDeal,
  checkDocumentAccess: documentBaseService.checkDocumentAccess,
  
  // Re-export methods from permission service
  checkUserCanModifyDocument: documentPermissionService.checkUserCanModifyDocument,
  checkUserCanDeleteDocument: documentPermissionService.checkUserCanDeleteDocument,
  checkUserCanDeleteVersion: documentPermissionService.checkUserCanDeleteVersion,
  
  // Re-export methods from retrieval service
  fetchDocuments: documentRetrievalDbService.fetchDocuments,
  fetchDocumentVersions: documentRetrievalDbService.fetchDocumentVersions,
  
  // Re-export methods from creation service
  saveDocumentMetadata: documentCreationService.saveDocumentMetadata,
  saveDocumentVersion: documentCreationService.saveDocumentVersion,
  
  // Re-export methods from deletion service
  deleteDocumentMetadata: documentDeletionService.deleteDocumentMetadata,
  deleteDocumentVersion: documentDeletionService.deleteDocumentVersion
};

// Re-export types
export type { DocumentMetadata, DocumentVersionMetadata } from "./documentDatabaseTypes";
