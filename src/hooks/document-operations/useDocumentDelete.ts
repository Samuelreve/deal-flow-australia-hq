
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
      await documentService.deleteDocument(document.id);
      
      if (notifyDocumentsChange) {
        const updatedDocuments = await documentService.getDocuments(dealId);
        notifyDocumentsChange(updatedDocuments);
        
        showSuccessToast(
          "Document deleted",
          `${document.name} has been deleted.`
        );
      }
      
      return true;
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
      await documentService.deleteDocumentVersion(version.id);
      
      // Inform parent component that versions have been updated
      if (onVersionsChange) {
        const updatedVersions = await documentService.getDocumentVersions(version.documentId);
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
      
      return true;
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
