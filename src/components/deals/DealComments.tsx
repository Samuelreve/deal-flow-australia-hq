
import { useState, useEffect, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Comment {
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

interface DealCommentsProps {
  dealId: string;
}

const DealComments = ({ dealId }: DealCommentsProps) => {
  const { user, session, isAuthenticated, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await fetchComments(); // Refetch to get the latest comments
    } catch (err: any) {
      console.error("Error posting comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Set up realtime subscription for comments
  useEffect(() => {
    if (!dealId) return;

    fetchComments();

    // Set up realtime subscription
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
          fetchComments(); // Refetch to get the complete comment with profile data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, fetchComments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading comments...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No comments yet</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.name || 'User')}&background=0D8ABC&color=fff`} 
                  alt={comment.profiles?.name || 'User'} 
                />
                <AvatarFallback>{(comment.profiles?.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.profiles?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-3 pt-3 border-t">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!newComment.trim() || submitting}
              size="sm"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-muted-foreground text-sm pt-3 border-t">
          Please sign in to post comments
        </p>
      )}
    </div>
  );
};

export default DealComments;
