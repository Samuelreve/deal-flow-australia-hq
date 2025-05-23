
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
    commentCount,
    handleSubmitComment,
    handleDeleteComment
  } = useDocumentComments(versionId);
  
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
  const handleSubmitCommentWrapper = useCallback(async () => {
    if (!commentContent.trim() || !versionId) return false;
    
    const success = await handleSubmitComment(
      commentContent,
      currentPage,
      locationData,
      selectedText
    );
    
    if (success) {
      // Reset UI state after successful comment
      setCommentContent('');
      setShowCommentInput(false);
      
      // Show the comment sidebar after posting
      setShowCommentSidebar(true);
    }
    
    return success;
  }, [
    commentContent, 
    versionId, 
    handleSubmitComment, 
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
    
    // Actions
    handleExplainClick,
    handleAddComment,
    handleSubmitComment: handleSubmitCommentWrapper,
    handleCloseCommentInput: () => setShowCommentInput(false),
    handleCloseExplanation,
    handleToggleCommentSidebar,
    handleDeleteComment
  };
}
