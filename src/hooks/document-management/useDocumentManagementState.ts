
import { useState, useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useDocumentManagementCore } from "./useDocumentManagementCore";
import { useDocumentManagementOperations } from "./useDocumentManagementOperations";

/**
 * Main hook for document management state and operations
 */
export const useDocumentManagementState = ({
  dealId,
  initialDocuments = [],
}: {
  dealId: string;
  initialDocuments: Document[];
}) => {
  // Core document management functionality
  const {
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    user,
    handleUpload,
    handleSelectDocument,
    handleSelectVersion,
    selectedVersionUrl,
    selectedVersionId,
    deleteDocument,
    deleteDocumentVersion,
    lastUploadedDocument,
    clearLastUploadedDocument,
    handleVersionsUpdated,
    handleDocumentsUpdated
  } = useDocumentManagementCore({ dealId, initialDocuments });

  // Dialog states
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [showVersionDeleteDialog, setShowVersionDeleteDialog] = useState(false);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [versionToShare, setVersionToShare] = useState<DocumentVersion | null>(null);

  // Enhanced operations with dialog handling
  const {
    handleDeleteDocument,
    handleDeleteVersion
  } = useDocumentManagementOperations({
    deleteDocument,
    deleteDocumentVersion,
    refreshDocuments: handleDocumentsUpdated,
    refreshVersions: handleVersionsUpdated,
    selectedDocument
  });

  // Dialog handlers
  const openDeleteDialog = useCallback((document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDocumentToDelete(null);
    setShowDeleteDialog(false);
    setIsDeleting(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    const success = await handleDeleteDocument(documentToDelete);
    if (success) {
      closeDeleteDialog();
    } else {
      setIsDeleting(false);
    }
  }, [documentToDelete, handleDeleteDocument, closeDeleteDialog]);

  const openVersionDeleteDialog = useCallback((version: DocumentVersion) => {
    setVersionToDelete(version);
    setShowVersionDeleteDialog(true);
  }, []);

  const closeVersionDeleteDialog = useCallback(() => {
    setVersionToDelete(null);
    setShowVersionDeleteDialog(false);
    setIsDeletingVersion(false);
  }, []);

  const confirmVersionDelete = useCallback(async () => {
    if (!versionToDelete) return;
    setIsDeletingVersion(true);
    const success = await handleDeleteVersion(versionToDelete);
    if (success) {
      closeVersionDeleteDialog();
    } else {
      setIsDeletingVersion(false);
    }
  }, [versionToDelete, handleDeleteVersion, closeVersionDeleteDialog]);

  const openShareDialog = useCallback((version: DocumentVersion) => {
    setVersionToShare(version);
    setShowShareDialog(true);
  }, []);

  const closeShareDialog = useCallback(() => {
    setVersionToShare(null);
    setShowShareDialog(false);
  }, []);

  return {
    // Document state
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    selectedVersionUrl,
    selectedVersionId,
    
    // User info
    user,
    
    // Upload and selection handlers
    handleUpload,
    handleSelectDocument,
    handleSelectVersion,
    
    // Analyzer support
    lastUploadedDocument,
    clearLastUploadedDocument,
    
    // Refresh handlers
    handleVersionsUpdated,
    handleDocumentsUpdated,
    
    // Delete dialog state and handlers
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    
    // Version delete dialog state and handlers
    versionToDelete,
    showVersionDeleteDialog,
    isDeletingVersion,
    openVersionDeleteDialog,
    closeVersionDeleteDialog,
    confirmVersionDelete,
    
    // Share dialog state and handlers
    showShareDialog,
    versionToShare,
    openShareDialog,
    closeShareDialog
  };
};
