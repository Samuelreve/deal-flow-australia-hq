
import React, { useEffect } from 'react';
import DocumentIframe from './DocumentIframe';
import DocumentLoadingState from './DocumentLoadingState';
import DocumentErrorState from './DocumentErrorState';
import DocumentCommentForm from './DocumentCommentForm';
import DocumentSelectionActions from './DocumentSelectionActions';

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
  showCommentSidebar?: boolean;
  setShowCommentInput: (show: boolean) => void;
  onCommentPosted?: () => void;
  onCommentCancel?: () => void;
  documentContainerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  aiLoading?: boolean;
  onExplainClick?: () => void;
  onCommentClick?: () => void;
  onCommentChange?: (content: string) => void;
  onCommentSubmit?: () => void;
  onCommentClose?: () => void;
  commentContent?: string;
  submitting?: boolean;
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
  showCommentSidebar,
  aiLoading,
  onExplainClick,
  onCommentClick,
  onCommentChange,
  onCommentSubmit,
  onCommentClose,
  commentContent,
  submitting
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

      {/* Selection action buttons */}
      {selectedText && buttonPosition && !showCommentInput && !aiLoading && (
        <DocumentSelectionActions
          buttonPosition={buttonPosition}
          onExplain={onExplainClick}
          onAddComment={onCommentClick}
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
