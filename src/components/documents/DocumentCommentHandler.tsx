
import { useCallback } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { toast } from '@/components/ui/use-toast';
import { DocumentComment } from '@/types/documentComment';

interface UseDocumentCommentHandlerProps {
  versionId?: string;
}

export function useDocumentCommentHandler({ versionId }: UseDocumentCommentHandlerProps) {
  const {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment,
    fetchComments
  } = useDocumentComments(versionId || '');

  // Calculate comment count
  const commentCount = comments?.length || 0;

  // Handle submitting a new comment
  const handleSubmitComment = useCallback(async (
    commentContent: string,
    currentPage: number,
    locationData: any,
    selectedText: string | null
  ) => {
    if (!commentContent.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive"
      });
      return false;
    }
    
    if (!versionId) {
      toast({
        title: "No document version selected",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      await addComment({
        content: commentContent,
        page_number: currentPage,
        location_data: locationData,
        selected_text: selectedText || ""
      });
      
      toast({
        title: "Comment added successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Failed to add comment",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    }
  }, [versionId, addComment]);

  // Handle deleting a comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast({
        title: "Comment deleted successfully"
      });
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Failed to delete comment",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    }
  }, [deleteComment]);

  return {
    comments,
    loading,
    submitting,
    commentCount,
    handleSubmitComment,
    handleDeleteComment,
    fetchComments
  };
}

export default useDocumentCommentHandler;
