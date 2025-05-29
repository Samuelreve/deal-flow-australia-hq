
import React from "react";
import { useSearchParams } from "react-router-dom";
import { Document } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import DocumentManagementGrid from "./document/DocumentManagementGrid";
import ContractAnalyzerDialog from "./document/ContractAnalyzerDialog";
import DocumentDialogs from "./document/DocumentDialogs";
import { useDocumentManagementState } from "@/hooks/document-management/useDocumentManagementState";

interface DocumentManagementProps {
  dealId: string;
  userRole: string;
  initialDocuments: Document[];
  isParticipant: boolean;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({
  dealId,
  userRole,
  initialDocuments,
  isParticipant
}) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check if analyzer should be open
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");
  const versionIdToAnalyze = searchParams.get("versionId");

  // Use the document management state hook
  const {
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    selectedVersionUrl,
    selectedVersionId,
    handleUpload,
    handleSelectDocument,
    handleSelectVersion,
    lastUploadedDocument,
    clearLastUploadedDocument,
    handleVersionsUpdated,
    handleDocumentsUpdated,
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    versionToDelete,
    showVersionDeleteDialog,
    isDeletingVersion,
    openVersionDeleteDialog,
    closeVersionDeleteDialog,
    confirmVersionDelete,
    showShareDialog,
    versionToShare,
    openShareDialog,
    closeShareDialog
  } = useDocumentManagementState({ dealId, initialDocuments });

  // Close analyzer handler
  const handleCloseAnalyzer = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("analyze");
    newSearchParams.delete("docId");
    newSearchParams.delete("versionId");
    setSearchParams(newSearchParams);
  };

  return (
    <>
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
        onShareVersion={openShareDialog}
        onVersionsUpdated={handleVersionsUpdated}
        onUpload={handleUpload}
        onCloseAnalyzer={clearLastUploadedDocument}
      />

      {/* Contract Analyzer Dialog */}
      {analyzeModeActive && docIdToAnalyze && versionIdToAnalyze && (
        <ContractAnalyzerDialog
          isOpen={analyzeModeActive}
          onClose={handleCloseAnalyzer}
          documentId={docIdToAnalyze}
          versionId={versionIdToAnalyze}
          dealId={dealId}
          userRole={userRole}
        />
      )}

      {/* Document Dialogs */}
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
    </>
  );
};

export default DocumentManagement;
