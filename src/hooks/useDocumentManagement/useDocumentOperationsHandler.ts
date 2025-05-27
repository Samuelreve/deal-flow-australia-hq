
import { useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useDocumentDialogState } from "./useDocumentDialogState";
import { toast } from "sonner";

interface UseDocumentOperationsHandlerProps {
  deleteDocument: (document: Document) => Promise<boolean>;
  deleteDocumentVersion: (version: DocumentVersion) => Promise<boolean>;
}

/**
 * Hook for handling document operations with dialog state
 */
export const useDocumentOperationsHandler = ({
  deleteDocument,
  deleteDocumentVersion
}: UseDocumentOperationsHandlerProps) => {
  const {
    // Document deletion
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    setIsDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    
    // Version deletion
    versionToDelete,
    showVersionDeleteDialog,
    isDeletingVersion,
    setIsDeletingVersion,
    openVersionDeleteDialog,
    closeVersionDeleteDialog,
    
    // Document sharing
    showShareDialog,
    versionToShare,
    handleShareVersion,
    closeShareDialog
  } = useDocumentDialogState();

  // Handle document deletion
  const confirmDelete = useCallback(async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete);
      toast.success("Document deleted successfully");
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  }, [documentToDelete, deleteDocument, closeDeleteDialog, setIsDeleting]);

  // Handle version deletion  
  const confirmVersionDelete = useCallback(async () => {
    if (!versionToDelete) return;
    
    setIsDeletingVersion(true);
    try {
      await deleteDocumentVersion(versionToDelete);
      toast.success("Version deleted successfully");
      closeVersionDeleteDialog();
    } catch (error) {
      console.error("Version delete failed:", error);
      toast.error("Failed to delete version");
    } finally {
      setIsDeletingVersion(false);
    }
  }, [versionToDelete, deleteDocumentVersion, closeVersionDeleteDialog, setIsDeletingVersion]);

  return {
    // Document deletion
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    
    // Version deletion
    openVersionDeleteDialog,
    closeVersionDeleteDialog,
    confirmVersionDelete,
    versionToDelete,
    showVersionDeleteDialog,
    isDeletingVersion,
    
    // Sharing
    handleShareVersion,
    closeShareDialog,
    showShareDialog,
    versionToShare
  };
};
