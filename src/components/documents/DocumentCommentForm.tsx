
import React from 'react';
import DocumentCommentInput from './DocumentCommentInput';
import { useDocumentCommentInput } from '@/hooks/useDocumentCommentInput';

interface DocumentCommentFormProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  pageNumber?: number;
  locationData?: any;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  onCommentPosted?: (newComment: any) => void;
  onCancel?: () => void;
}

const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  selectedText,
  buttonPosition,
  pageNumber,
  locationData,
  dealId,
  documentId,
  versionId,
  onCommentPosted,
  onCancel
}) => {
  const {
    commentContent,
    setCommentContent,
    isPosting,
    handleSubmitComment
  } = useDocumentCommentInput({
    versionId,
    onCommentPosted,
    onCancel
  });

  const handleSubmit = () => {
    return handleSubmitComment(locationData, pageNumber, selectedText);
  };

  return (
    <DocumentCommentInput
      dealId={dealId}
      documentId={documentId}
      versionId={versionId}
      pageNumber={pageNumber}
      locationData={locationData}
      selectedText={selectedText}
      buttonPosition={buttonPosition}
      isPosting={isPosting}
      commentContent={commentContent}
      setCommentContent={setCommentContent}
      onSubmit={handleSubmit}
      onClose={onCancel || (() => {})}
    />
  );
};

export default DocumentCommentForm;
