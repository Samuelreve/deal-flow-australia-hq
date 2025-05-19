
import React from 'react';
import DocumentCommentInput from './DocumentCommentInput';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentCommentFormProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  commentContent: string;
  submitting: boolean;
  onCommentChange: (content: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  pageNumber?: number;
  locationData?: any;
}

const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  selectedText,
  buttonPosition,
  commentContent,
  submitting,
  onCommentChange,
  onSubmit,
  onClose,
  pageNumber,
  locationData,
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
      pageNumber={pageNumber}
      locationData={locationData}
    />
  );
};

export default DocumentCommentForm;
