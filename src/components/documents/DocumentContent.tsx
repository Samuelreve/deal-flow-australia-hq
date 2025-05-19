
import React from 'react';
import DocumentSelectionActions from './DocumentSelectionActions';
import DocumentCommentInput from './DocumentCommentInput';
import DocumentLoadingState from './DocumentLoadingState';
import DocumentErrorState from './DocumentErrorState';
import DocumentIframe from './DocumentIframe';
import { useDocumentLoader } from '@/hooks/useDocumentLoader';

interface DocumentContentProps {
  documentContainerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  documentVersionUrl: string;
  showCommentSidebar: boolean;
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  showExplanation: boolean;
  showCommentInput: boolean;
  aiLoading: boolean;
  handleExplainSelectedText: () => void;
  handleAddComment: () => void;
  commentContent: string;
  setCommentContent: (content: string) => void;
  submitting: boolean;
  handleSubmitComment: () => void;
  handleCloseCommentInput: () => void;
}

const DocumentContent: React.FC<DocumentContentProps> = ({
  documentContainerRef,
  handleMouseUp,
  documentVersionUrl,
  showCommentSidebar,
  selectedText,
  buttonPosition,
  showExplanation,
  showCommentInput,
  aiLoading,
  handleExplainSelectedText,
  handleAddComment,
  commentContent,
  setCommentContent,
  submitting,
  handleSubmitComment,
  handleCloseCommentInput,
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
      onMouseUp={handleMouseUp}
      className={`flex-1 overflow-y-auto border rounded-lg p-4 bg-white shadow-sm relative ${showCommentSidebar ? 'w-2/3' : 'w-full'}`}
      style={{ minHeight: '400px' }}
    >
      {/* Loading state */}
      {documentLoading && <DocumentLoadingState />}

      {/* Error state */}
      {documentError && <DocumentErrorState error={documentError} />}

      {/* Document content */}
      {!documentLoading && !documentError && (
        <DocumentIframe
          documentVersionUrl={documentVersionUrl}
          onLoad={handleDocumentLoad}
          onError={handleDocumentError}
        />
      )}

      {/* Selection action buttons */}
      {selectedText && buttonPosition && !showExplanation && !showCommentInput && !aiLoading && (
        <DocumentSelectionActions
          buttonPosition={buttonPosition}
          onExplain={handleExplainSelectedText}
          onAddComment={handleAddComment}
        />
      )}

      {/* Comment input form */}
      {showCommentInput && (
        <DocumentCommentInput
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          isPosting={submitting}  // Pass submitting as isPosting
          submitting={submitting} // Keep submitting for backward compatibility
          onSubmit={handleSubmitComment}
          onClose={handleCloseCommentInput}
        />
      )}
    </div>
  );
};

export default DocumentContent;
