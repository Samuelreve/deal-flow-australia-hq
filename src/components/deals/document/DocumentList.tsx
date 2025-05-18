import { useState } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import DocumentVersionList from "./DocumentVersionList";
import DocumentVersionWithComments from "./DocumentVersionWithComments";
import DocumentListItem from "./DocumentListItem";
import DocumentEmptyState from "./DocumentEmptyState";
import DocumentLoadingState from "./DocumentLoadingState";
import DocumentVersionHeader from "./DocumentVersionHeader";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDeleteDocument?: (document: Document) => void;
  userRole?: string;
  userId?: string;
  isParticipant?: boolean;
  onSelectDocument?: (document: Document) => void;
  selectedDocument?: Document | null;
  documentVersions: DocumentVersion[];
  loadingVersions: boolean;
  onDeleteVersion?: (version: DocumentVersion) => void;
}

const DocumentList = ({
  documents,
  isLoading,
  onDeleteDocument,
  userRole = 'user',
  userId,
  isParticipant = false,
  onSelectDocument,
  selectedDocument,
  documentVersions,
  loadingVersions,
  onDeleteVersion
}: DocumentListProps) => {
  // Add state for selected version
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  // Handle version selection
  const handleSelectVersion = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  // Reset selected version when document changes
  const handleSelectDocument = (document: Document) => {
    setSelectedVersion(null);
    onSelectDocument?.(document);
  };
  
  // If a version is selected, show it with comments
  if (selectedVersion) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-2 border-b flex justify-between items-center">
          <button 
            className="text-sm text-muted-foreground hover:text-primary flex items-center"
            onClick={() => setSelectedVersion(null)}
          >
            ← Back to Versions
          </button>
          <span className="text-sm font-medium">
            {selectedDocument?.name} - Version {selectedVersion.versionNumber}
          </span>
        </div>
        <div className="flex-grow">
          <DocumentVersionWithComments
            version={selectedVersion}
            currentUserDealRole={userRole}
            isParticipant={isParticipant}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <DocumentLoadingState />;
  }

  if (documents.length === 0) {
    return <DocumentEmptyState />;
  }

  // If a document is selected, show its versions
  if (selectedDocument) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <DocumentVersionHeader 
          document={selectedDocument} 
          onBack={() => onSelectDocument?.(undefined as any)}
          dealId={selectedDocument.dealId}
          userRole={userRole}
        />

        <DocumentVersionList
          documentId={selectedDocument.id}
          versions={documentVersions}
          isLoading={loadingVersions}
          userRole={userRole}
          userId={userId}
          onDeleteVersion={onDeleteVersion}
          isParticipant={isParticipant}
          onSelectVersion={handleSelectVersion}
          selectedVersionId={selectedVersion?.id}
        />
      </div>
    );
  }

  // Otherwise, show the list of documents
  return (
    <div className="space-y-4">
      {documents.map((document) => {
        const canDelete = 
          isParticipant && 
          onDeleteDocument &&
          (document.uploadedBy === userId || 
           userRole === 'admin' || 
           userRole === 'seller');
        
        return (
          <DocumentListItem
            key={document.id}
            document={document}
            canDelete={canDelete}
            onDelete={(doc) => onDeleteDocument?.(doc)}
            onSelect={handleSelectDocument}
          />
        );
      })}
    </div>
  );
};

export default DocumentList;
