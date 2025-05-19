
import React, { useEffect } from 'react';
import DocumentIframe from './DocumentIframe';
import DocumentLoadingState from './DocumentLoadingState';
import DocumentErrorState from './DocumentErrorState';
import DocumentCommentForm from './DocumentCommentForm';

interface DocumentViewerContentProps {
  documentVersionUrl: string;
  documentLoading: boolean;
  documentError: string | null;
  setDocumentLoading: (loading: boolean) => void;
  setDocumentError: (error: string | null) => void;
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  showCommentInput: boolean;
  setShowCommentInput: (show: boolean) => void;
  onCommentPosted?: () => void;
  onCommentCancel?: () => void;
  documentContainerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
}

const DocumentViewerContent: React.FC<DocumentViewerContentProps> = ({
  documentVersionUrl,
  documentLoading,
  documentError,
  setDocumentLoading,
  setDocumentError,
  selectedText,
  buttonPosition,
  dealId,
  documentId,
  versionId,
  showCommentInput,
  setShowCommentInput,
  onCommentPosted,
  onCommentCancel,
  documentContainerRef,
  handleMouseUp,
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

  // Reset state when document URL changes
  useEffect(() => {
    setDocumentLoading(true);
    setDocumentError(null);
  }, [documentVersionUrl, setDocumentLoading, setDocumentError]);

  // Comment handling
  const handleCommentCancel = () => {
    setShowCommentInput(false);
    if (onCommentCancel) {
      onCommentCancel();
    }
  };

  return (
    <div 
      ref={documentContainerRef}
      className="relative h-full w-full overflow-hidden"
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

      {/* Comment form */}
      {showCommentInput && selectedText && buttonPosition && versionId && (
        <DocumentCommentForm
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
          onCommentPosted={onCommentPosted}
          onCancel={handleCommentCancel}
        />
      )}
    </div>
  );
};

export default DocumentViewerContent;
