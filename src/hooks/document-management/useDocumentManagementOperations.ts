
import { useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { toast } from "sonner";

interface UseDocumentManagementOperationsProps {
  deleteDocument: (document: Document) => Promise<boolean>;
  deleteDocumentVersion: (version: DocumentVersion) => Promise<boolean>;
  refreshDocuments: () => void;
  refreshVersions: (documentId?: string) => void;
  selectedDocument: Document | null;
}

/**
 * Hook for handling document management operations
 */
export const useDocumentManagementOperations = ({
  deleteDocument,
  deleteDocumentVersion,
  refreshDocuments,
  refreshVersions,
  selectedDocument
}: UseDocumentManagementOperationsProps) => {

  // Enhanced delete document with proper error handling
  const handleDeleteDocument = useCallback(async (document: Document): Promise<boolean> => {
    try {
      const success = await deleteDocument(document);
      if (success) {
        toast.success("Document deleted successfully");
        refreshDocuments();
      }
      return success;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  }, [deleteDocument, refreshDocuments]);

  // Enhanced delete version with proper error handling
  const handleDeleteVersion = useCallback(async (version: DocumentVersion): Promise<boolean> => {
    try {
      const success = await deleteDocumentVersion(version);
      if (success) {
        toast.success("Version deleted successfully");
        if (selectedDocument) {
          refreshVersions(selectedDocument.id);
        }
      }
      return success;
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("Failed to delete version");
      return false;
    }
  }, [deleteDocumentVersion, refreshVersions, selectedDocument]);

  // Handle versions updated
  const handleVersionsUpdated = useCallback(() => {
    if (selectedDocument) {
      refreshVersions(selectedDocument.id);
    }
  }, [selectedDocument, refreshVersions]);

  return {
    handleDeleteDocument,
    handleDeleteVersion,
    handleVersionsUpdated
  };
};
