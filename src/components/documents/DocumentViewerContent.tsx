
import React from 'react';
import DocumentIframe from './DocumentIframe';
import DocumentLoadingState from './DocumentLoadingState';
import DocumentErrorState from './DocumentErrorState';

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
  documentLoading,
  documentError,
  setDocumentLoading,
  setDocumentError,
  documentContainerRef,
  handleMouseUp,
  showCommentSidebar,
}) => {
  // Handle document load/error
  const handleDocumentLoad = () => {
    setDocumentLoading(false);
    setDocumentError(null);
  };

  const handleDocumentError = () => {
    setDocumentError('Failed to load document');
    setDocumentLoading(false);
  };

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
