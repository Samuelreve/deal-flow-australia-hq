
import { Document } from "@/types/documentVersion";
import DocumentViewerSection from "./document/DocumentViewerSection";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import DocumentSidebar from "./document/DocumentSidebar";
import DocumentDialogs from "./document/DocumentDialogs";

// Define props for the DocumentManagement component
interface DocumentManagementProps {
  dealId: string;
  userRole?: string;
  initialDocuments?: Document[];
  isParticipant?: boolean;
}

const DocumentManagement = ({ 
  dealId, 
  userRole = "user", 
  initialDocuments = [],
  isParticipant = false
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Document sidebar with list and upload functionality */}
        <DocumentSidebar
          documents={documents}
          isLoading={isLoading}
          onDeleteDocument={openDeleteDialog}
          userRole={userRole}
          userId={user?.id}
          isParticipant={isParticipant}
          onSelectDocument={handleSelectDocument}
          selectedDocument={selectedDocument}
          documentVersions={documentVersions}
          loadingVersions={loadingVersions}
          onDeleteVersion={openVersionDeleteDialog}
          onSelectVersion={handleSelectVersion}
          selectedVersionId={selectedVersionId}
          onShareVersion={handleShareVersion}
          dealId={dealId}
          onVersionsUpdated={handleVersionsUpdated}
          uploading={uploading}
          onUpload={handleUpload}
          lastUploadedDocument={lastUploadedDocument}
          onCloseAnalyzer={clearLastUploadedDocument}
        />
        
        {/* Document Viewer Section */}
        <DocumentViewerSection 
          selectedVersionUrl={selectedVersionUrl}
          documentVersions={documentVersions}
          dealId={dealId}
          selectedDocument={selectedDocument}
          selectedVersionId={selectedVersionId}
          onVersionsUpdated={handleVersionsUpdated}
        />
      </div>
      
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
