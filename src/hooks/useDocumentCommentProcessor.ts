
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useDocumentCommentHandling } from '@/hooks/useDocumentCommentHandling';

interface UseDocumentCommentProcessorProps {
  versionId?: string;
}

export function useDocumentCommentProcessor({ versionId }: UseDocumentCommentProcessorProps) {
  const [selectionDetails, setSelectionDetails] = useState<{
    selectedText: string | null;
    pageNumber?: number;
    locationData: any;
  } | null>(null);
  
  const {
    comments,
    commentContent,
    setCommentContent,
    showCommentInput,
    submitting,
    activeCommentId,
    setActiveCommentId,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput,
    setShowCommentInput
  } = useDocumentCommentHandling({ versionId });
  
  // Handle comment triggered from document viewer
  const handleCommentClick = () => {
    handleAddComment(selectionDetails?.selectedText || null, selectionDetails?.locationData, selectionDetails?.pageNumber);
  };

  // Handle submitting a comment
  const handleCommentSubmit = async () => {
    await handleSubmitComment();
    toast({
      title: "Comment posted",
      description: "Your comment has been added successfully"
    });
  };
  
  // Handle comment posting triggered from viewer selection
  const handleCommentTriggered = (selection: { text: string; pageNumber?: number; locationData: any }) => {
    setSelectionDetails({
      selectedText: selection.text,
      pageNumber: selection.pageNumber,
      locationData: selection.locationData
    });
    handleAddComment(selection.text, selection.locationData, selection.pageNumber);
  };

  return {
    comments,
    commentContent,
    setCommentContent,
    showCommentInput,
    submitting,
    activeCommentId,
    setActiveCommentId,
    handleAddComment,
    handleCommentClick,
    handleSubmitComment,
    handleCommentTriggered,
    handleCloseCommentInput,
    setSelectionDetails
  };
}
