
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentComment } from "@/types/documentComment";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchVersionComments, 
  addDocumentComment, 
  editDocumentComment,
  deleteDocumentComment,
  toggleCommentResolved
} from "./commentOperations";
import { 
  addCommentToState, 
  updateCommentInState, 
  removeCommentFromState,
  updateCommentResolvedStatus
} from "./commentStateUpdaters";
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for managing document comments
 */
export function useDocumentComments(documentVersionId?: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [commentsChannel, setCommentsChannel] = useState<RealtimeChannel | null>(null);
  
  /**
   * Load comments for a document version
   */
  const fetchComments = useCallback(async () => {
    if (!documentVersionId) return;
    
    setLoading(true);
    try {
      const fetchedComments = await fetchVersionComments(documentVersionId);
      setComments(fetchedComments);
    } finally {
      setLoading(false);
    }
  }, [documentVersionId]);

  /**
   * Initialize comments when document version changes and setup realtime subscription
   */
  useEffect(() => {
    if (documentVersionId) {
      fetchComments();
      
      // Setup realtime subscription
      const channel = supabase.channel(`document_comments:${documentVersionId}`);

      channel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'document_comments', 
            filter: `document_version_id=eq.${documentVersionId}` 
          },
          (payload) => {
            console.log('Realtime comment INSERT received:', payload);
            
            // Get the new comment and fetch related user data
            const fetchCommentDetails = async () => {
              try {
                const { data, error } = await supabase
                  .from('document_comments')
                  .select(`
                    *,
                    user:profiles(id, name, email, avatar_url)
                  `)
                  .eq('id', payload.new.id)
                  .single();
                
                if (error) throw error;
                
                if (data) {
                  setComments(prevComments => addCommentToState(prevComments, data));
                }
              } catch (err) {
                console.error('Error fetching new comment details:', err);
              }
            };
            
            fetchCommentDetails();
          }
        )
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'document_comments', 
            filter: `document_version_id=eq.${documentVersionId}` 
          },
          (payload) => {
            console.log('Realtime comment UPDATE received:', payload);
            const updatedComment = payload.new as DocumentComment;
            
            if (updatedComment.content) {
              // Content update
              setComments(prevComments => 
                updateCommentInState(prevComments, updatedComment.id, updatedComment.content)
              );
            }
            
            // Update resolved status if it has changed
            if (payload.old.resolved !== updatedComment.resolved) {
              setComments(prevComments => 
                updateCommentResolvedStatus(prevComments, updatedComment.id, updatedComment.resolved)
              );
            }
          }
        )
        .on(
          'postgres_changes',
          { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'document_comments', 
            filter: `document_version_id=eq.${documentVersionId}` 
          },
          (payload) => {
            console.log('Realtime comment DELETE received:', payload);
            const deletedComment = payload.old as DocumentComment;
            setComments(prevComments => 
              removeCommentFromState(prevComments, deletedComment.id, deletedComment.parent_comment_id)
            );
          }
        )
        .subscribe();
      
      setCommentsChannel(channel);
      
      // Cleanup function
      return () => {
        console.log('Cleaning up document comments subscription');
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      setComments([]);
      
      // Clean up any existing channel when documentVersionId changes/becomes undefined
      if (commentsChannel) {
        supabase.removeChannel(commentsChannel);
        setCommentsChannel(null);
      }
    }
  }, [documentVersionId, fetchComments]);

  /**
   * Add a new comment
   */
  const addComment = async (newCommentData: Omit<any, 'documentVersionId'>) => {
    if (!documentVersionId || !user) return null;

    setSubmitting(true);
    try {
      const newComment = await addDocumentComment(documentVersionId, newCommentData, user.id);
      
      // With realtime enabled, the comment will be added via the subscription
      // But we'll still update state immediately for better UX
      if (newComment) {
        setComments(prevComments => addCommentToState(prevComments, newComment));
      }
      
      return newComment;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Edit a comment
   */
  const editComment = async (commentId: string, content: string) => {
    setSubmitting(true);
    try {
      const success = await editDocumentComment(commentId, content);
      
      // With realtime enabled, the comment will be updated via the subscription
      // But we'll still update state immediately for better UX
      if (success) {
        setComments(prevComments => updateCommentInState(prevComments, commentId, content));
      }
      
      return success;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Delete a comment
   */
  const deleteComment = async (commentId: string, parentId?: string) => {
    const success = await deleteDocumentComment(commentId);
    
    // With realtime enabled, the comment will be removed via the subscription
    // But we'll still update state immediately for better UX
    if (success) {
      setComments(prevComments => removeCommentFromState(prevComments, commentId, parentId));
    }
    
    return success;
  };

  /**
   * Toggle resolved status
   */
  const toggleResolved = async (commentId: string) => {
    try {
      const { newStatus } = await toggleCommentResolved(commentId);
      
      // With realtime enabled, the comment will be updated via the subscription
      // But we'll still update state immediately for better UX
      if (newStatus !== undefined) {
        setComments(prevComments => 
          updateCommentResolvedStatus(prevComments, commentId, newStatus)
        );
      }
      
      return true;
    } catch (error: any) {
      console.error("Error toggling comment status:", error);
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
