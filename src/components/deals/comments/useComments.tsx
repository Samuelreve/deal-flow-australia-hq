
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Comment, UseCommentsProps } from "./types";
import { fetchDealComments, addComment, getAuthToken } from "./commentsApiService";
import { deleteComment } from "./commentUtils";

export const useComments = ({ dealId }: UseCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  const currentUserId = user?.id;

  // Load comments for the deal
  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dealComments = await fetchDealComments(dealId);
      setComments(dealComments);
    } catch (err: any) {
      console.error("Failed to load comments:", err);
      setError(err.message || "Failed to load comments.");
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  // Load comments on component mount and when dealId changes
  useEffect(() => {
    if (dealId) {
      loadComments();
    }
  }, [dealId, loadComments]);

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user?.id) return;
    
    setSubmitting(true);
    
    try {
      await addComment(dealId, user.id, newComment);
      setNewComment("");
      loadComments(); // Refresh comments list
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      toast({
        title: "Error",
        description: "Failed to post your comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      // First get the auth token
      const accessToken = await getAuthToken();
      
      // Call the delete function
      const response = await deleteComment(commentId, accessToken);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }
      
      // Remove the deleted comment from state
      setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
      
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    loading,
    submitting,
    error,
    handleSubmitComment,
    handleDeleteComment,
    currentUserId,
  };
};
