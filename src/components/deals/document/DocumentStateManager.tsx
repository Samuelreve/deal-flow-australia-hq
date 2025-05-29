
import React from 'react';
import { Document, DocumentVersion } from "@/types/documentVersion";

interface DocumentStateManagerProps {
  documents: Document[];
  selectedDocument: Document | null;
  documentVersions: DocumentVersion[];
  selectedVersionId: string | null;
  onDocumentSelect: (document: Document) => void;
  onVersionSelect: (version: DocumentVersion) => void;
  children: (state: {
    documents: Document[];
    selectedDocument: Document | null;
    documentVersions: DocumentVersion[];
    selectedVersionId: string | null;
  }) => React.ReactNode;
}

const DocumentStateManager: React.FC<DocumentStateManagerProps> = ({
  documents,
  selectedDocument,
  documentVersions,
  selectedVersionId,
  onDocumentSelect,
  onVersionSelect,
  children
}) => {
  return (
    <>
      {children({
        documents,
        selectedDocument,
        documentVersions,
        selectedVersionId
      })}
    </>
  );
};

export default DocumentStateManager;
