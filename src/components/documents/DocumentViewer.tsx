
import React from 'react';
import DocumentViewerContainer from './DocumentViewerContainer';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentVersionUrl: string; // The secure URL of the document version file
  dealId: string; // The ID of the deal
  documentId?: string; // The ID of the logical document (optional for AI context)
  versionId?: string; // The ID of the specific document version (optional for AI context)
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

// This component is now a thin wrapper around DocumentViewerContainer
const DocumentViewer: React.FC<DocumentViewerProps> = (props) => {
  return <DocumentViewerContainer {...props} />;
};

export default DocumentViewer;
