import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document, DocumentVersion } from "@/types/deal";
import DocumentList from "./document/DocumentList";
import DocumentUpload from "./document/DocumentUpload";
import DeleteDocumentDialog from "./document/DeleteDocumentDialog";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentViewer from "@/components/documents/DocumentViewer";

interface DeleteVersionDialogProps {
  version: DocumentVersion | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteVersionDialog = ({
  version,
  isOpen,
  isDeleting,
  onClose,
  onConfirm
}: DeleteVersionDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Delete Version</h3>
        <p>Are you sure you want to delete version {version?.versionNumber}?</p>
        <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
        
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Version'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
    await uploadDocument(file, category, documentId);
  };

  // Handle selecting a version for viewing
  const handleSelectVersion = (version: DocumentVersion) => {
    if (version && version.url) {
      setSelectedVersionUrl(version.url);
    }
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
          />

          {/* Document Upload Section - Only shown if user has appropriate permissions */}
          <DocumentUpload 
            onUpload={handleUpload}
            uploading={uploading}
            userRole={userRole}
            isParticipant={isParticipant}
            documents={documents}
            dealId={dealId} // Pass dealId to DocumentUpload
          />
        </div>
        
        <div className="lg:col-span-2 h-[600px]">
          {/* Document Viewer */}
          {selectedVersionUrl && documentVersions.length > 0 ? (
            <DocumentViewer 
              documentVersionUrl={selectedVersionUrl}
              dealId={dealId}
              documentId={selectedDocument?.id}
              versionId={documentVersions.find(v => v.url === selectedVersionUrl)?.id}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/50 rounded-lg border">
              <p className="text-muted-foreground">
                {documentVersions.length > 0 
                  ? "Select a document version to view" 
                  : "No documents available for viewing"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        document={documentToDelete}
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />

      {/* Delete Version Dialog */}
      <DeleteVersionDialog
        version={versionToDelete}
        isOpen={showVersionDeleteDialog}
        isDeleting={isDeletingVersion}
        onClose={closeVersionDeleteDialog}
        onConfirm={confirmVersionDelete}
      />
    </div>
  );
};

export default DocumentManagement;
