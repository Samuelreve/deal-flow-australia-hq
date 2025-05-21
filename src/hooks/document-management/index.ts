
import { useDocumentManagementCore } from "./useDocumentManagementCore";
import { useDocumentOperationsHandler } from "./useDocumentOperationsHandler";
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
  // Use the core document management functionality
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
  } = useDocumentManagementCore({
    dealId,
    initialDocuments
  });
  
  // Use the document operations handler
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
    deleteDocument,
    deleteDocumentVersion
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
    handleDocumentsUpdated,
    
    // User info
    user,
    isParticipant
  };
};

// Re-export for backward compatibility
export * from "./useDocumentManagementCore";
export * from "./useDocumentDialogState";
export * from "./useDocumentOperationsHandler";
