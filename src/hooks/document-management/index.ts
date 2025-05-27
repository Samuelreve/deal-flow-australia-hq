
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useDocumentOperationsHandler } from "./useDocumentOperationsHandler";
import { useDocumentManagementState } from "./useDocumentManagementState";
import { useDocumentSelectionHandler } from "./useDocumentSelectionHandler";
import { useDocumentUploadHandler } from "./useDocumentUploadHandler";
import { useDocumentManagementOperations } from "./useDocumentManagementOperations";
import { Document } from "@/types/documentVersion";

export interface UseDocumentManagementProps {
  dealId: string;
  initialDocuments?: Document[];
  isParticipant?: boolean;
}

/**
 * Main hook for document management that composes other specialized hooks
 */
export const useDocumentManagement = ({
  dealId,
  initialDocuments = [],
  isParticipant = false
}: UseDocumentManagementProps) => {
  const { user } = useAuth();

  // Initialize document hooks
  const {
    documents,
    isLoading,
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    selectedVersionId,
    selectedVersionUrl,
    selectVersion,
    uploading,
    uploadDocument,
    deleteDocument,
    deleteDocumentVersion,
    refreshDocuments,
    refreshVersions
  } = useDocuments(dealId, initialDocuments);

  // State management
  const {
    lastUploadedDocument,
    setLastUploadedDocument,
    clearLastUploadedDocument,
    analyzeModeActive,
    docIdToAnalyze
  } = useDocumentManagementState();

  // Selection handling
  const {
    handleSelectDocument,
    handleSelectVersion
  } = useDocumentSelectionHandler({
    documents,
    selectDocument,
    selectVersion,
    analyzeModeActive,
    docIdToAnalyze
  });

  // Upload handling
  const { handleUpload } = useDocumentUploadHandler({
    uploadDocument,
    selectDocument,
    selectVersion,
    setLastUploadedDocument
  });

  // Operations handling
  const {
    handleDeleteDocument,
    handleDeleteVersion,
    handleVersionsUpdated
  } = useDocumentManagementOperations({
    deleteDocument,
    deleteDocumentVersion,
    refreshDocuments,
    refreshVersions,
    selectedDocument
  });

  // Dialog operations handler
  const {
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    openVersionDeleteDialog,
    closeVersionDeleteDialog,
    confirmVersionDelete,
    versionToDelete,
    showVersionDeleteDialog,
    isDeletingVersion,
    handleShareVersion,
    closeShareDialog,
    showShareDialog,
    versionToShare
  } = useDocumentOperationsHandler({
    deleteDocument: handleDeleteDocument,
    deleteDocumentVersion: handleDeleteVersion
  });

  return {
    // Document list state and handlers
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    handleSelectDocument,
    handleUpload,
    
    // Document deletion
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    
    // Version operations
    handleSelectVersion,
    selectedVersionUrl,
    selectedVersionId,
    
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
    versionToShare,
    
    // Inline analyzer
    lastUploadedDocument,
    clearLastUploadedDocument,
    
    // Updates
    handleVersionsUpdated,
    
    // User info
    user,
    isParticipant
  };
};

// Re-export for backward compatibility
export * from "./useDocumentManagementCore";
export * from "./useDocumentDialogState";
export * from "./useDocumentOperationsHandler";
export * from "./useDocumentManagementState";
export * from "./useDocumentSelectionHandler";
export * from "./useDocumentUploadHandler";
export * from "./useDocumentManagementOperations";
