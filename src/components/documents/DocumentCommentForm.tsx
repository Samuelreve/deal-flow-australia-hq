
import React from 'react';
import DocumentCommentInput from './DocumentCommentInput';

interface DocumentCommentFormProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  commentContent: string;
  submitting: boolean;
  onCommentChange: (content: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  selectedText,
  buttonPosition,
  commentContent,
  submitting,
  onCommentChange,
  onSubmit,
  onClose,
}) => {
  return (
    <DocumentCommentInput
      selectedText={selectedText}
      buttonPosition={buttonPosition}
      commentContent={commentContent}
      setCommentContent={onCommentChange}
      submitting={submitting}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};

export default DocumentCommentForm;
