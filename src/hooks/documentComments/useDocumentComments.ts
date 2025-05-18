
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentComment, CreateDocumentCommentDto } from "@/services/documentComment";
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
      const fetchedComments = await fetchVersionComments(documentVersionId);
      setComments(fetchedComments);
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
    if (!documentVersionId || !user) return null;

    setSubmitting(true);
    try {
      const newComment = await addDocumentComment(documentVersionId, newCommentData, user.id);
      
      // Update comments list if comment was added successfully
      if (newComment) {
        setComments(prevComments => addCommentToState(prevComments, newComment));
      }
      
      return newComment;
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a comment
  const editComment = async (commentId: string, content: string) => {
    setSubmitting(true);
    try {
      const success = await editDocumentComment(commentId, content);
      
      // Update the comment in our state if edit was successful
      if (success) {
        setComments(prevComments => updateCommentInState(prevComments, commentId, content));
      }
      
      return success;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string, parentId?: string) => {
    const success = await deleteDocumentComment(commentId);
    
    // Update our state if deletion was successful
    if (success) {
      setComments(prevComments => removeCommentFromState(prevComments, commentId, parentId));
    }
    
    return success;
  };

  // Toggle resolved status
  const toggleResolved = async (commentId: string) => {
    try {
      const newStatus = await documentCommentService.toggleResolved(commentId);
      
      // Update our state
      setComments(prevComments => 
        updateCommentResolvedStatus(prevComments, commentId, newStatus)
      );
      
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
