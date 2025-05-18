
import { toast } from "@/components/ui/use-toast";
import { 
  DocumentComment, 
  CreateDocumentCommentDto, 
  documentCommentService 
} from "@/services/documentComment";

/**
 * Helper functions for document comment operations
 */

/**
 * Fetch comments for a document version
 */
export const fetchVersionComments = async (documentVersionId: string): Promise<DocumentComment[]> => {
  try {
    return await documentCommentService.getCommentsByVersionId(documentVersionId);
  } catch (error: any) {
    console.error("Error fetching document comments:", error);
    toast({
      title: "Error",
      description: "Failed to load document comments",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Add a new comment to a document version
 */
export const addDocumentComment = async (
  documentVersionId: string, 
  newCommentData: Omit<CreateDocumentCommentDto, 'documentVersionId'>,
  userId?: string
): Promise<DocumentComment | null> => {
  if (!documentVersionId || !userId) {
    toast({
      title: "Error",
      description: "You must be logged in to add comments",
      variant: "destructive",
    });
    return null;
  }

  try {
    const commentData: CreateDocumentCommentDto = {
      ...newCommentData,
      documentVersionId
    };
    
    return await documentCommentService.createComment(commentData);
  } catch (error: any) {
    console.error("Error adding comment:", error);
    toast({
      title: "Error",
      description: "Failed to add your comment",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Edit an existing comment
 */
export const editDocumentComment = async (commentId: string, content: string): Promise<boolean> => {
  try {
    await documentCommentService.updateComment(commentId, content);
    
    toast({
      title: "Comment updated",
      description: "Your comment has been updated successfully",
    });
    return true;
  } catch (error: any) {
    console.error("Error updating comment:", error);
    toast({
      title: "Error",
      description: "Failed to update your comment",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Delete a comment
 */
export const deleteDocumentComment = async (commentId: string): Promise<boolean> => {
  try {
    await documentCommentService.deleteComment(commentId);
    
    toast({
      title: "Comment deleted",
      description: "The comment has been deleted successfully",
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    toast({
      title: "Error",
      description: "Failed to delete comment",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Toggle a comment's resolved status
 */
export const toggleCommentResolved = async (commentId: string): Promise<{ newStatus: boolean }> => {
  try {
    const newStatus = await documentCommentService.toggleResolved(commentId);
    
    toast({
      title: newStatus ? "Comment resolved" : "Comment reopened",
      description: newStatus 
        ? "The comment has been marked as resolved" 
        : "The comment has been reopened",
    });
    return { newStatus };
  } catch (error: any) {
    console.error("Error toggling comment status:", error);
    toast({
      title: "Error",
      description: "Failed to update comment status",
      variant: "destructive",
    });
    throw error;
  }
};
