
import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import DocumentViewerContainer from './DocumentViewerContainer';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentVersionUrl: string; // The secure URL of the document version file
  dealId: string; // The ID of the deal
  documentId?: string; // The ID of the logical document (optional for AI context)
  versionId?: string; // The ID of the specific document version (optional for AI context)
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
  onTextSelected?: (text: string | null) => void; // New callback for selected text
}

// Define the interface for the methods exposed via the ref
export interface DocumentViewerRef {
  highlightLocation: (locationData: any) => void;
}

// This component is now a thin wrapper around DocumentViewerContainer that exposes the ref
const DocumentViewer = forwardRef<DocumentViewerRef, DocumentViewerProps>((props, ref) => {
  const { onTextSelected } = props;

  // Handle text selection
  const handleTextSelection = useCallback((text: string | null) => {
    if (onTextSelected) {
      onTextSelected(text);
    }
  }, [onTextSelected]);

  // Create enhanced props with the text selection handler
  const enhancedProps = {
    ...props,
    onTextSelected: handleTextSelection
  };

  // Simply forward the ref to the DocumentViewerContainer
  return <DocumentViewerContainer {...enhancedProps} ref={ref} />;
});

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer;
