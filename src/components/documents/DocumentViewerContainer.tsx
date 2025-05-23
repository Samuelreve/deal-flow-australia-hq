
import React, { forwardRef, useState } from 'react';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';
import DocumentViewerState from './DocumentViewerState';
import DocumentViewerLayout from './DocumentViewerLayout';

interface DocumentViewerContainerProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
  onTextSelected?: (text: string | null) => void;
}

const DocumentViewerContainer = forwardRef<any, DocumentViewerContainerProps>((props, ref) => {
  const { documentVersionUrl, dealId, documentId, versionId, onCommentTriggered, onTextSelected } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const highlightRef = React.useRef({ highlightElement: null, highlightLocation: () => {} });

  // Setup viewer refs
  const documentViewerRef = useDocumentViewerRef(highlightRef, ref);
  
  return (
    <DocumentViewerState
      currentPage={currentPage}
      versionId={versionId}
      dealId={dealId}
      onCommentTriggered={onCommentTriggered}
      onTextSelected={onTextSelected}
    >
      {(state) => (
        <DocumentViewerLayout
          documentVersionUrl={documentVersionUrl}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
          currentPage={currentPage}
          forwardedRef={ref}
          {...state}
        />
      )}
    </DocumentViewerState>
  );
});

DocumentViewerContainer.displayName = 'DocumentViewerContainer';

export default DocumentViewerContainer;
