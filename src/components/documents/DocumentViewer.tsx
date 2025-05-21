
import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import DocumentViewerContainer from './DocumentViewerContainer';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentUrl: string; // The secure URL of the document file
  onTextSelection?: (text: string | null) => void; // Callback for selected text
}

// Define the interface for the methods exposed via the ref
export interface DocumentViewerRef {
  highlightLocation: (locationData: any) => void;
}

// This component is now a thin wrapper around DocumentViewerContainer that exposes the ref
const DocumentViewer = forwardRef<DocumentViewerRef, DocumentViewerProps>((props, ref) => {
  const { onTextSelection } = props;

  // Handle text selection
  const handleTextSelection = useCallback((text: string | null) => {
    if (onTextSelection) {
      onTextSelection(text);
    }
  }, [onTextSelection]);

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
