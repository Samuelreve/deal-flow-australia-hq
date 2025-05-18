
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Comment {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface UseCommentsProps {
  dealId: string;
}

export const useComments = ({ dealId }: UseCommentsProps) => {
  const { user, session, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentsChannel, setCommentsChannel] = useState<RealtimeChannel | null>(null);

  const currentUserId = user?.id || '';

  const fetchComments = useCallback(async () => {
    if (!dealId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          deal_id,
          user_id,
          content,
          created_at,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq("deal_id", dealId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          deal_id: dealId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (err: any) {
      console.error("Error posting comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) return;
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      // Fix: Properly access the session property from the getSession() response
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session?.access_token) {
        throw new Error("Unauthorized: No auth token");
      }

      const response = await fetch(
        `https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/delete-comment/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          }
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete comment");
      }
      
      toast.success('Comment deleted successfully');
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      toast.error(err.message || "Failed to delete comment");
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!dealId) return;

    const channel = supabase
      .channel(`deal-comments-${dealId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `deal_id=eq.${dealId}`
        },
        (payload) => {
          console.log("New comment received:", payload);
          fetchComments();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `deal_id=eq.${dealId}`
        },
        (payload) => {
          console.log("Comment deleted:", payload);
          fetchComments();
        }
      )
      .subscribe();

    setCommentsChannel(channel);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, fetchComments]);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
    isAuthenticated
  };
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
