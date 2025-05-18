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
  onSelectVersion?: (version: DocumentVersion) => void; // Add missing prop
  selectedVersionId?: string; // Add missing prop
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
  onDeleteVersion,
  onSelectVersion, // Add the prop here
  selectedVersionId // Add the prop here
}: DocumentListProps) => {
  // Handle version selection
  const handleSelectVersion = (version: DocumentVersion) => {
    onSelectVersion?.(version);
  };

  // Handle document selection
  const handleSelectDocument = (document: Document) => {
    onSelectDocument?.(document);
  };
  
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
          dealId={selectedDocument.id}
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
          selectedVersionId={selectedVersionId}
        />
      </div>
    );
  }

  // Otherwise, show the list of documents
  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <DocumentListItem
          key={document.id}
          document={document}
          isSelected={selectedDocument?.id === document.id}
          onSelect={() => handleSelectDocument(document)}
          onDelete={onDeleteDocument ? () => onDeleteDocument(document) : undefined}
          versions={documentVersions.filter(v => v.document_id === document.id)}
          loadingVersions={loadingVersions}
          userRole={userRole}
          userId={userId}
          onDeleteVersion={onDeleteVersion}
          onSelectVersion={onSelectVersion}
          isParticipant={isParticipant}
        />
      ))}
    </div>
  );
};

export default DocumentList;
