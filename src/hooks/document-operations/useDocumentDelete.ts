
import { Document, DocumentVersion } from "@/types/deal";
import { documentService } from "@/services/documentService";
import { useDocumentOperationsBase } from "./useDocumentOperationsBase";

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
      const success = await documentService.deleteDocument(document, dealId, user.id);
      
      if (success && notifyDocumentsChange) {
        const updateDocuments = (prevDocuments: Document[]) => 
          prevDocuments.filter(doc => doc.id !== document.id);
        notifyDocumentsChange(updateDocuments([]));
        
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
      // Extract storage path from URL
      const storagePath = version.url.split('?')[0].split('/').pop();
      if (!storagePath) {
        throw new Error("Could not determine file path from URL");
      }
      
      const success = await documentService.deleteDocumentVersion(
        version.id, 
        version.documentId, 
        dealId, 
        storagePath,
        user.id
      );
      
      if (success) {
        // Inform parent component that versions have been updated
        if (onVersionsChange) {
          const updateVersions = (prevVersions: DocumentVersion[]) => 
            prevVersions.filter(v => v.id !== version.id);
          onVersionsChange(updateVersions([]));
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
