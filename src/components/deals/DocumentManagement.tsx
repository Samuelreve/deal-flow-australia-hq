
import React from "react";
import { Document } from "@/types/documentVersion";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import DocumentManagementHeader from "./document/DocumentManagementHeader";
import DocumentManagementGrid from "./document/DocumentManagementGrid";
import DocumentDialogs from "./document/DocumentDialogs";

// Define props for the DocumentManagement component
interface DocumentManagementProps {
  dealId: string;
  userRole?: string;
  initialDocuments?: Document[];
  isParticipant?: boolean;
  dealTitle?: string;
}

const DocumentManagement = ({ 
  dealId, 
  userRole = "user", 
  initialDocuments = [],
  isParticipant = false,
  dealTitle
}: DocumentManagementProps) => {
  const {
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
    user
  } = useDocumentManagement({ 
    dealId, 
    initialDocuments, 
    isParticipant 
  });

  return (
    <div className="space-y-4">
      <DocumentManagementHeader dealTitle={dealTitle} />
      
      <DocumentManagementGrid
        documents={documents}
        isLoading={isLoading}
        selectedDocument={selectedDocument}
        documentVersions={documentVersions}
        loadingVersions={loadingVersions}
        selectedVersionUrl={selectedVersionUrl}
        selectedVersionId={selectedVersionId}
        userRole={userRole}
        userId={user?.id}
        isParticipant={isParticipant}
        dealId={dealId}
        uploading={uploading}
        lastUploadedDocument={lastUploadedDocument}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={openDeleteDialog}
        onDeleteVersion={openVersionDeleteDialog}
        onSelectVersion={handleSelectVersion}
        onShareVersion={handleShareVersion}
        onVersionsUpdated={handleVersionsUpdated}
        onUpload={handleUpload}
        onCloseAnalyzer={clearLastUploadedDocument}
      />
      
      {/* All dialog components */}
      <DocumentDialogs
        documentToDelete={documentToDelete}
        showDeleteDialog={showDeleteDialog}
        isDeleting={isDeleting}
        onCloseDeleteDialog={closeDeleteDialog}
        onConfirmDelete={confirmDelete}
        versionToDelete={versionToDelete}
        showVersionDeleteDialog={showVersionDeleteDialog}
        isDeletingVersion={isDeletingVersion}
        onCloseVersionDeleteDialog={closeVersionDeleteDialog}
        onConfirmVersionDelete={confirmVersionDelete}
        showShareDialog={showShareDialog}
        onCloseShareDialog={closeShareDialog}
        versionToShare={versionToShare}
        documentName={selectedDocument?.name}
      />
    </div>
  );
};

export default DocumentManagement;
