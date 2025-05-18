
import { Document } from "@/types/deal";
import { documentService } from "@/services/documentService";
import { useDocumentOperationsBase } from "./useDocumentOperationsBase";

/**
 * Hook for document upload operations
 */
export const useDocumentUpload = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void
) => {
  const { 
    user, 
    setUploading, 
    onDocumentsChange: notifyDocumentsChange,
    showSuccessToast,
    showErrorToast 
  } = useDocumentOperationsBase(dealId, onDocumentsChange);

  /**
   * Upload a document (new document or new version)
   */
  const uploadDocument = async (file: File, category: string, existingDocumentId?: string) => {
    if (!user) {
      throw new Error('You must be logged in to upload files.');
    }

    setUploading(true);

    try {
      const newDocument = await documentService.uploadDocument(
        file, 
        category, 
        dealId, 
        user.id,
        existingDocumentId
      );
      
      if (existingDocumentId) {
        // Let parent component know document was updated
        if (notifyDocumentsChange) {
          const updateDocuments = (prevDocuments: Document[]) => 
            prevDocuments.map(doc => 
              doc.id === existingDocumentId ? newDocument : doc
            );
          notifyDocumentsChange(updateDocuments([]));
        }
        
        showSuccessToast(
          "New version uploaded",
          `Version ${newDocument.version} of ${file.name} has been uploaded.`
        );
      } else {
        // Let parent component know a new document was added
        if (notifyDocumentsChange) {
          const updateDocuments = (prevDocuments: Document[]) => [newDocument, ...prevDocuments];
          notifyDocumentsChange(updateDocuments([]));
        }
        
        showSuccessToast(
          "File uploaded successfully!",
          `${file.name} has been uploaded.`
        );
      }

      return newDocument;
    } catch (error: any) {
      showErrorToast(error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Save a generated template as a document
   */
  const saveGeneratedTemplate = async (content: string, fileName: string, category: string) => {
    if (!user) {
      throw new Error('You must be logged in to save templates.');
    }

    setUploading(true);

    try {
      // Convert text content to a file object
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], fileName, { type: 'text/plain' });
      
      // Use the existing upload mechanism
      const newDocument = await uploadDocument(file, category);
      
      return newDocument;
    } catch (error) {
      // Error is already handled in uploadDocument, just rethrow
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadDocument,
    saveGeneratedTemplate,
    uploading: setUploading
  };
};
