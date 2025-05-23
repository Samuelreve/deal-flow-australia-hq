
import { useState, useCallback } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';

interface UseDocumentInteractionsProps {
  versionId?: string;
  dealId: string;
  selectedText: string | null;
  locationData: any;
  currentPage: number;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

export function useDocumentInteractions({
  versionId,
  dealId,
  selectedText,
  locationData,
  currentPage,
  onCommentTriggered
}: UseDocumentInteractionsProps) {
  // UI state
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  
  // Get comment functionality
  const { 
    comments,
    loading: commentsLoading,
    submitting,
    fetchComments,
    addComment,
    deleteComment: handleDeleteComment,
    editComment,
    toggleResolved
  } = useDocumentComments(versionId);
  
  // Calculate comment count from comments array
  const commentCount = comments ? comments.length : 0;
  
  // Get explanation functionality
  const {
    aiLoading,
    explanationResult,
    handleExplainSelectedText,
    handleCloseExplanation
  } = useDocumentExplanation({ dealId });
  
  // Handle explain button click
  const handleExplainClick = useCallback(() => {
    setShowCommentInput(false);
    setShowExplanation(true);
    if (selectedText) {
      handleExplainSelectedText(selectedText);
    }
  }, [selectedText, handleExplainSelectedText]);
  
  // Handle adding a comment
  const handleAddComment = useCallback(() => {
    setShowExplanation(false);
    setShowCommentInput(true);
    if (onCommentTriggered && selectedText && locationData) {
      onCommentTriggered({
        text: selectedText,
        pageNumber: currentPage,
        locationData
      });
    }
  }, [
    selectedText, 
    locationData, 
    currentPage, 
    onCommentTriggered
  ]);
  
  // Handle submitting a new comment
  const handleSubmitComment = useCallback(async () => {
    if (!commentContent.trim() || !versionId) return false;
    
    const commentData = {
      content: commentContent,
      page_number: currentPage,
      location_data: locationData,
      selected_text: selectedText
    };
    
    try {
      await addComment(commentData);
      
      // Reset UI state after successful comment
      setCommentContent('');
      setShowCommentInput(false);
      
      // Show the comment sidebar after posting
      setShowCommentSidebar(true);
      
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  }, [
    commentContent, 
    versionId, 
    addComment, 
    currentPage, 
    locationData, 
    selectedText
  ]);
  
  // Toggle comment sidebar
  const handleToggleCommentSidebar = useCallback(() => {
    setShowCommentSidebar(prev => !prev);
  }, []);
  
  return {
    // States
    showExplanation,
    setShowExplanation,
    showCommentInput,
    setShowCommentInput,
    showCommentSidebar,
    setShowCommentSidebar,
    commentContent,
    setCommentContent,
    commentsLoading,
    submitting,
    commentCount,
    aiLoading,
    explanationResult,
    comments,
    
    // Actions
    handleExplainClick,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput: () => setShowCommentInput(false),
    handleCloseExplanation,
    handleToggleCommentSidebar,
    handleDeleteComment,
    editComment,
    toggleResolved,
    fetchComments
  };
}
