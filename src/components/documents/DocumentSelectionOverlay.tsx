
import React from 'react';
import DocumentSelectionActions from './DocumentSelectionActions';
import DocumentCommentForm from './DocumentCommentForm';

interface DocumentSelectionOverlayProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  aiLoading: boolean;
  showCommentInput: boolean;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  onExplainClick: () => void;
  onCommentClick: () => void;
  onCommentSubmit: () => void;
  onCommentClose: () => void;
  onCommentChange: (content: string) => void;
  commentContent: string;
  submitting: boolean;
  onCommentPosted?: () => void;
  onCommentCancel?: () => void;
}

const DocumentSelectionOverlay: React.FC<DocumentSelectionOverlayProps> = ({
  selectedText,
  buttonPosition,
  aiLoading,
  showCommentInput,
  dealId,
  documentId,
  versionId,
  onExplainClick,
  onCommentClick,
  onCommentSubmit,
  onCommentClose,
  onCommentChange,
  commentContent,
  submitting,
  onCommentPosted,
  onCommentCancel
}) => {
  return (
    <>
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
          onCancel={onCommentCancel}
        />
      )}
    </>
  );
};

export default DocumentSelectionOverlay;
