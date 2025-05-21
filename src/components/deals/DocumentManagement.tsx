
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document, DocumentVersion } from "@/types/deal";
import DocumentList from "./document/DocumentList";
import DocumentUpload from "./document/DocumentUpload";
import DeleteDocumentDialog from "./document/DeleteDocumentDialog";
import DeleteVersionDialog from "./document/DeleteVersionDialog";
import DocumentViewerSection from "./document/DocumentViewerSection";
import { useDocuments } from "@/hooks/useDocuments";
import ShareDocumentDialog from "./document/ShareDocumentDialog";
import InlineDocumentAnalyzer from "./document/InlineDocumentAnalyzer";

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
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVersionDeleteDialog, setShowVersionDeleteDialog] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  const [selectedVersionUrl, setSelectedVersionUrl] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [versionToShare, setVersionToShare] = useState<DocumentVersion | null>(null);
  
  // Track the last uploaded document for inline analysis
  const [lastUploadedDocument, setLastUploadedDocument] = useState<{
    id: string;
    versionId: string;
    name: string;
  } | null>(null);

  const { 
    documents, 
    isLoading, 
    uploading, 
    uploadDocument, 
    deleteDocument,
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    deleteDocumentVersion
  } = useDocuments(dealId, initialDocuments);

  // Handle document deletion
  const openDeleteDialog = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };
  
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete);
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle version deletion
  const openVersionDeleteDialog = (version: DocumentVersion) => {
    setVersionToDelete(version);
    setShowVersionDeleteDialog(true);
  };
  
  const closeVersionDeleteDialog = () => {
    setShowVersionDeleteDialog(false);
    setVersionToDelete(null);
  };
  
  const confirmVersionDelete = async () => {
    if (!versionToDelete) return;
    
    setIsDeletingVersion(true);
    try {
      await deleteDocumentVersion(versionToDelete);
      closeVersionDeleteDialog();
    } finally {
      setIsDeletingVersion(false);
    }
  };

  // Handle document upload with category and optional documentId
  const handleUpload = async (file: File, category: string, documentId?: string) => {
    const uploadedDoc = await uploadDocument(file, category, documentId);
    
    // If upload was successful, set the last uploaded document info for inline analysis
    if (uploadedDoc) {
      setLastUploadedDocument({
        id: uploadedDoc.id,
        versionId: uploadedDoc.latest_version_id || '',
        name: uploadedDoc.name || file.name
      });
    }
  };

  // Handle selecting a version for viewing
  const handleSelectVersion = (version: DocumentVersion) => {
    if (version && version.url) {
      setSelectedVersionUrl(version.url);
      setSelectedVersionId(version.id);
    }
  };
  
  // Handle sharing a document version
  const handleShareVersion = (version: DocumentVersion) => {
    setVersionToShare(version);
    setShowShareDialog(true);
  };
  
  const closeShareDialog = () => {
    setShowShareDialog(false);
    setVersionToShare(null);
  };
  
  // Clear the last uploaded document info
  const clearLastUploadedDocument = () => {
    setLastUploadedDocument(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          {/* Document List */}
          <DocumentList 
            documents={documents}
            isLoading={isLoading}
            onDeleteDocument={openDeleteDialog}
            userRole={userRole}
            userId={user?.id}
            isParticipant={isParticipant}
            onSelectDocument={selectDocument}
            selectedDocument={selectedDocument}
            documentVersions={documentVersions}
            loadingVersions={loadingVersions}
            onDeleteVersion={openVersionDeleteDialog}
            onSelectVersion={handleSelectVersion}
            selectedVersionId={selectedVersionId}
            onShareVersion={handleShareVersion}
          />

          {/* Document Upload Section */}
          <DocumentUpload 
            onUpload={handleUpload}
            uploading={uploading}
            userRole={userRole}
            isParticipant={isParticipant}
            documents={documents}
            dealId={dealId}
          />
          
          {/* Inline Document Analyzer for the last uploaded document */}
          {lastUploadedDocument && (
            <InlineDocumentAnalyzer
              documentId={lastUploadedDocument.id}
              versionId={lastUploadedDocument.versionId}
              documentName={lastUploadedDocument.name}
              dealId={dealId}
              userRole={userRole}
              onClose={clearLastUploadedDocument}
            />
          )}
        </div>
        
        {/* Document Viewer Section */}
        <DocumentViewerSection 
          selectedVersionUrl={selectedVersionUrl}
          documentVersions={documentVersions}
          dealId={dealId}
          selectedDocument={selectedDocument}
          selectedVersionId={selectedVersionId}
        />
      </div>
      
      {/* Dialog Components */}
      <DeleteDocumentDialog
        document={documentToDelete}
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />

      <DeleteVersionDialog
        version={versionToDelete}
        isOpen={showVersionDeleteDialog}
        isDeleting={isDeletingVersion}
        onClose={closeVersionDeleteDialog}
        onConfirm={confirmVersionDelete}
      />
      
      <ShareDocumentDialog
        isOpen={showShareDialog}
        onClose={closeShareDialog}
        documentVersion={versionToShare || undefined}
        documentName={selectedDocument?.name}
      />
    </div>
  );
};

export default DocumentManagement;
