
import { useState, useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";

/**
 * Hook for managing document dialog states
 */
export const useDocumentDialogState = () => {
  // Document deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Version deletion state
  const [showVersionDeleteDialog, setShowVersionDeleteDialog] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [versionToShare, setVersionToShare] = useState<DocumentVersion | null>(null);

  // Handle document deletion dialog
  const openDeleteDialog = useCallback((document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  }, []);
  
  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
  }, []);

  // Handle version deletion dialog
  const openVersionDeleteDialog = useCallback((version: DocumentVersion) => {
    setVersionToDelete(version);
    setShowVersionDeleteDialog(true);
  }, []);
  
  const closeVersionDeleteDialog = useCallback(() => {
    setShowVersionDeleteDialog(false);
    setVersionToDelete(null);
  }, []);

  // Handle sharing dialog
  const handleShareVersion = useCallback((version: DocumentVersion) => {
    setVersionToShare(version);
    setShowShareDialog(true);
  }, []);
  
  const closeShareDialog = useCallback(() => {
    setShowShareDialog(false);
    setVersionToShare(null);
  }, []);

  return {
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
  };
};
