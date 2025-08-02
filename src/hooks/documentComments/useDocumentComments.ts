
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentComment } from "@/types/documentComment";
import { fetchVersionComments, addDocumentComment, editDocumentComment, deleteDocumentComment, toggleCommentResolved } from "./commentOperations";
import { addCommentToState, updateCommentInState, removeCommentFromState, updateCommentResolvedStatus } from "./commentStateUpdaters";
import { useCommentRealtime } from "./useCommentRealtime";

/**
 * Custom hook for managing document comments
 */
export function useDocumentComments(documentVersionId?: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  console.log('useDocumentComments called with documentVersionId:', documentVersionId);
  
  /**
   * Load comments for a document version
   */
  const fetchComments = useCallback(async () => {
    if (!documentVersionId) return;
    
    setLoading(true);
    try {
      const fetchedComments = await fetchVersionComments(documentVersionId);
      console.log('Fetched comments for version:', documentVersionId);
      console.log('Comments fetched:', fetchedComments.length);
      setComments(fetchedComments);
    } finally {
      setLoading(false);
    }
  }, [documentVersionId]);

  // Set up real-time updates for comments
  const handleNewComment = useCallback((newComment: DocumentComment) => {
    console.log('Adding new comment via realtime:', newComment);
    setComments(prevComments => addCommentToState(prevComments, newComment));
  }, []);

  const handleUpdatedComment = useCallback((updatedComment: DocumentComment) => {
    if (updatedComment.content) {
      // Content update
      setComments(prevComments => 
        updateCommentInState(prevComments, updatedComment.id, updatedComment.content)
      );
    }
    
    // Update resolved status if it has changed
    if ('resolved' in updatedComment) {
      setComments(prevComments => 
        updateCommentResolvedStatus(prevComments, updatedComment.id, updatedComment.resolved)
      );
    }
  }, []);

  const handleDeletedComment = useCallback((deletedComment: DocumentComment) => {
    setComments(prevComments => 
      removeCommentFromState(prevComments, deletedComment.id, deletedComment.parent_comment_id)
    );
  }, []);

  // Initialize the real-time subscription
  useCommentRealtime(
    documentVersionId,
    handleNewComment,
    handleUpdatedComment,
    handleDeletedComment
  );

  // Initialize comments when documentVersionId changes
  useEffect(() => {
    if (documentVersionId) {
      fetchComments();
    } else {
      setComments([]);
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
