
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { DocumentComment, CreateDocumentCommentDto, documentCommentService } from "@/services/documentCommentService";

export function useDocumentComments(documentVersionId?: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Load comments for a document version
  const fetchComments = useCallback(async () => {
    if (!documentVersionId) return;
    
    setLoading(true);
    try {
      const fetchedComments = await documentCommentService.getCommentsByVersionId(documentVersionId);
      setComments(fetchedComments);
    } catch (error: any) {
      console.error("Error fetching document comments:", error);
      toast({
        title: "Error",
        description: "Failed to load document comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [documentVersionId]);

  useEffect(() => {
    if (documentVersionId) {
      fetchComments();
    } else {
      setComments([]);
    }
  }, [documentVersionId, fetchComments]);

  // Add a new comment
  const addComment = async (newCommentData: Omit<CreateDocumentCommentDto, 'documentVersionId'>) => {
    if (!documentVersionId || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to add comments",
        variant: "destructive",
      });
      return null;
    }

    setSubmitting(true);
    try {
      const commentData: CreateDocumentCommentDto = {
        ...newCommentData,
        documentVersionId
      };
      
      const newComment = await documentCommentService.createComment(commentData);
      
      // Update comments list
      if (newComment.parentCommentId) {
        // For replies, find parent and add to its replies
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === newComment.parentCommentId 
              ? { 
                  ...comment, 
                  replies: [...(comment.replies || []), newComment]
                }
              : comment
          )
        );
      } else {
        // For top-level comments, add to the list
        setComments(prevComments => [...prevComments, newComment]);
      }
      
      return newComment;
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add your comment",
        variant: "destructive",
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a comment
  const editComment = async (commentId: string, content: string) => {
    setSubmitting(true);
    try {
      await documentCommentService.updateComment(commentId, content);
      
      // Update the comment in our state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content };
          }
          // Check in replies if not found at top level
          if (comment.replies?.length) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, content } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
      
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
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string, parentId?: string) => {
    try {
      await documentCommentService.deleteComment(commentId);
      
      // Update our state
      if (parentId) {
        // If it's a reply, remove from parent's replies
        setComments(prevComments =>
          prevComments.map(comment => 
            comment.id === parentId
              ? { 
                  ...comment, 
                  replies: comment.replies?.filter(reply => reply.id !== commentId) || []
                }
              : comment
          )
        );
      } else {
        // If it's a top-level comment, remove from the list
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      }
      
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

  // Toggle resolved status
  const toggleResolved = async (commentId: string) => {
    try {
      const newStatus = await documentCommentService.toggleResolved(commentId);
      
      // Update our state
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, resolved: newStatus };
          }
          // Check in replies if not found at top level
          if (comment.replies?.length) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, resolved: newStatus } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
      
      toast({
        title: newStatus ? "Comment resolved" : "Comment reopened",
        description: newStatus 
          ? "The comment has been marked as resolved" 
          : "The comment has been reopened",
      });
      return true;
    } catch (error: any) {
      console.error("Error toggling comment status:", error);
      toast({
        title: "Error",
        description: "Failed to update comment status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    comments,
    loading,
    submitting,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
    toggleResolved
  };
}
