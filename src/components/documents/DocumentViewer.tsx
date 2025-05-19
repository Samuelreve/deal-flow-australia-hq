
import React, { forwardRef, useImperativeHandle } from 'react';
import DocumentViewerContainer from './DocumentViewerContainer';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentVersionUrl: string; // The secure URL of the document version file
  dealId: string; // The ID of the deal
  documentId?: string; // The ID of the logical document (optional for AI context)
  versionId?: string; // The ID of the specific document version (optional for AI context)
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

// Define the interface for the methods exposed via the ref
export interface DocumentViewerRef {
  highlightLocation: (locationData: any) => void;
}

// This component is now a thin wrapper around DocumentViewerContainer that exposes the ref
const DocumentViewer = forwardRef<DocumentViewerRef, DocumentViewerProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    highlightLocation: (locationData: any) => {
      console.log('DocumentViewer: Highlighting location:', locationData);
      // The actual implementation is delegated to the DocumentViewerContainer
    }
  }));

  return <DocumentViewerContainer {...props} ref={ref} />;
});

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer;
