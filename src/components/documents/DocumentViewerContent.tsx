
import React from 'react';
import DocumentIframe from './DocumentIframe';
import DocumentLoadingState from './DocumentLoadingState';
import DocumentErrorState from './DocumentErrorState';
import { useDocumentLoader } from '@/hooks/useDocumentLoader';

interface DocumentViewerContentProps {
  documentVersionUrl: string;
  documentLoading: boolean;
  documentError: string | null;
  setDocumentLoading: (loading: boolean) => void;
  setDocumentError: (error: string | null) => void;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  showCommentSidebar?: boolean;
  documentContainerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  onCommentPosted?: () => void;
}

const DocumentViewerContent: React.FC<DocumentViewerContentProps> = ({
  documentVersionUrl,
  showCommentSidebar,
  documentContainerRef,
  handleMouseUp
}) => {
  const {
    documentLoading,
    documentError,
    handleDocumentLoad,
    handleDocumentError
  } = useDocumentLoader(documentVersionUrl);

  return (
    <div 
      ref={documentContainerRef}
      className={`relative h-full overflow-hidden ${showCommentSidebar ? 'w-2/3' : 'w-full'}`}
      onMouseUp={handleMouseUp}
    >
      {documentLoading ? (
        <DocumentLoadingState />
      ) : documentError ? (
        <DocumentErrorState error={documentError} />
      ) : (
        <DocumentIframe 
          documentVersionUrl={documentVersionUrl}
          onLoad={handleDocumentLoad}
          onError={handleDocumentError}
        />
      )}
    </div>
  );
};

export default DocumentViewerContent;
