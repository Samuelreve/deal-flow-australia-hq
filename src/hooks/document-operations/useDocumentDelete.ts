
import { Document, DocumentVersion } from "@/types/documentVersion";
import { documentService } from "@/services/documentService";
import { useDocumentOperationsBase } from "./useDocumentOperationsBase";
import { adaptDocumentToDealType } from "@/utils/documentTypeAdapter";

/**
 * Hook for document deletion operations
 */
export const useDocumentDelete = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void,
  onVersionsChange?: (versions: DocumentVersion[]) => void
) => {
  const { 
    user, 
    onDocumentsChange: notifyDocumentsChange,
    showSuccessToast,
    showErrorToast 
  } = useDocumentOperationsBase(dealId, onDocumentsChange);

  /**
   * Delete a document
   */
  const deleteDocument = async (document: Document) => {
    if (!user) {
      throw new Error('You must be logged in to delete files.');
    }
    
    try {
      // Convert to deal document type for the service call
      const dealDocument = adaptDocumentToDealType(document);
      const success = await documentService.deleteDocument(dealDocument, dealId, user.id);
      
      if (success && notifyDocumentsChange) {
        const updatedDocuments = await documentService.getDocuments(dealId);
        notifyDocumentsChange(updatedDocuments);
        
        showSuccessToast(
          "Document deleted",
          `${document.name} has been deleted.`
        );
      }
      
      return success;
    } catch (error: any) {
      showErrorToast(error);
      return false;
    }
  };

  /**
   * Delete a specific version of a document
   */
  const deleteDocumentVersion = async (version: DocumentVersion) => {
    if (!user) {
      throw new Error('You must be logged in to delete document versions.');
    }
    
    try {
      // Delete the version with correct parameters
      const success = await documentService.deleteDocumentVersion(
        version,
        dealId, 
        user.id,
        version.documentId,
        version.documentId
      );
      
      if (success) {
        // Inform parent component that versions have been updated
        if (onVersionsChange) {
          const updatedVersions = await documentService.getDocumentVersions(dealId, version.documentId);
          onVersionsChange(updatedVersions);
        }
        
        // Refresh documents to get updated latest_version_id
        const updatedDocuments = await documentService.getDocuments(dealId);
        if (notifyDocumentsChange) {
          notifyDocumentsChange(updatedDocuments);
        }
        
        showSuccessToast(
          "Version deleted",
          `Version ${version.versionNumber} has been deleted.`
        );
      }
      
      return success;
    } catch (error: any) {
      showErrorToast(error);
      return false;
    }
  };

  return {
    deleteDocument,
    deleteDocumentVersion
  };
};
