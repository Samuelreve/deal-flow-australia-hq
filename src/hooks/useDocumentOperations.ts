
import { useState } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";

/**
 * Hook for document operations like upload, delete, etc.
 */
export const useDocumentOperations = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void,
  onVersionsChange?: (versions: DocumentVersion[]) => void
) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

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
        if (onDocumentsChange) {
          const updateDocuments = (prevDocuments: Document[]) => 
            prevDocuments.map(doc => 
              doc.id === existingDocumentId ? newDocument : doc
            );
          onDocumentsChange(updateDocuments([]));
        }
        
        toast({
          title: "New version uploaded",
          description: `Version ${newDocument.version} of ${file.name} has been uploaded.`,
        });
      } else {
        // Let parent component know a new document was added
        if (onDocumentsChange) {
          const updateDocuments = (prevDocuments: Document[]) => [newDocument, ...prevDocuments];
          onDocumentsChange(updateDocuments([]));
        }
        
        toast({
          title: "File uploaded successfully!",
          description: `${file.name} has been uploaded.`,
        });
      }

      return newDocument;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your file.",
        variant: "destructive",
      });
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

  /**
   * Delete a document
   */
  const deleteDocument = async (document: Document) => {
    if (!user) {
      throw new Error('You must be logged in to delete files.');
    }
    
    try {
      const success = await documentService.deleteDocument(document, dealId, user.id);
      
      if (success && onDocumentsChange) {
        const updateDocuments = (prevDocuments: Document[]) => 
          prevDocuments.filter(doc => doc.id !== document.id);
        onDocumentsChange(updateDocuments([]));
        
        toast({
          title: "Document deleted",
          description: `${document.name} has been deleted.`,
        });
      }
      
      return success;
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the file.",
        variant: "destructive",
      });
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
        if (onDocumentsChange) {
          onDocumentsChange(updatedDocuments);
        }
        
        toast({
          title: "Version deleted",
          description: `Version ${version.versionNumber} has been deleted.`,
        });
      }
      
      return success;
    } catch (error: any) {
      console.error("Delete version error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the version.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploading,
    uploadDocument,
    saveGeneratedTemplate,
    deleteDocument,
    deleteDocumentVersion
  };
};
