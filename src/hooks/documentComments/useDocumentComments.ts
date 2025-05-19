
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentComment } from "@/types/documentComment";
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

/**
 * Custom hook for managing document comments
 */
export function useDocumentComments(documentVersionId?: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
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
   * Initialize comments when document version changes
   */
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
