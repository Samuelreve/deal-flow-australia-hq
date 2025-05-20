
import React, { forwardRef, useRef, useState, useCallback } from 'react';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import { useDocumentViewerState } from '@/hooks/useDocumentViewerState';
import { useDocumentComments } from '@/hooks/useDocumentComments';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';
import { toast } from '@/components/ui/use-toast';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';

interface DocumentViewerContainerProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
  onTextSelected?: (text: string | null) => void;
}

const DocumentViewerContainer = forwardRef<any, DocumentViewerContainerProps>((props, ref) => {
  const { documentVersionUrl, dealId, documentId, versionId, onCommentTriggered, onTextSelected } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const highlightRef = useRef({ highlightElement: null, highlightLocation: () => {} });

  // Setup viewer refs
  const documentViewerRef = useDocumentViewerRef(highlightRef, ref);
  
  // Use selection hook to track text selection
  const {
    selectedText,
    buttonPosition,
    locationData,
    documentContainerRef,
    handleMouseUp,
    clearSelection,
    setSelectedText
  } = useDocumentSelection(currentPage);
  
  // Notify parent when text is selected
  React.useEffect(() => {
    if (onTextSelected) {
      onTextSelected(selectedText);
    }
  }, [selectedText, onTextSelected]);
  
  // Use viewer state hook for UI state management
  const {
    showCommentSidebar,
    setShowCommentSidebar,
    showExplanation,
    setShowExplanation,
    showCommentInput, 
    setShowCommentInput,
    commentContent,
    setCommentContent,
    explanationResult,
    setExplanationResult,
    handleToggleCommentSidebar
  } = useDocumentViewerState({ documentVersionUrl });
  
  // Use document comments hook for comment functionality
  const { 
    comments,
    isLoadingComments,
    commentCount, 
    handleAddComment,
    isAddingComment
  } = useDocumentComments({
    dealId,
    documentId,
    versionId
  });

  // Use document explanation hook for AI explanation functionality
  const {
    aiLoading,
    handleExplainSelectedText,
    handleCloseExplanation
  } = useDocumentExplanation({
    dealId
  });

  const { deleteComment } = useDocumentOperations();
  
  // Handle opening the comment input form
  const handleOpenCommentInput = () => {
    setShowExplanation(false);
    setShowCommentInput(true);
  };

  // Handle closing the comment input form
  const handleCloseCommentInput = () => {
    setShowCommentInput(false);
    clearSelection();
  };

  // Handle submitting a new comment
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await handleAddComment({
        content: commentContent,
        documentVersionId: versionId,
        selection: {
          text: selectedText || "",
          pageNumber: currentPage,
          locationData
        }
      });
      
      // Reset UI state after successful comment
      setCommentContent('');
      setShowCommentInput(false);
      clearSelection();
      
      // Show the comment sidebar after posting
      setShowCommentSidebar(true);
      
      toast({
        title: "Comment added successfully"
      });
      
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Failed to add comment",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Handle explain button click
  const handleExplainClick = useCallback(() => {
    setShowCommentInput(false);
    setShowExplanation(true);
    handleExplainSelectedText(selectedText);
  }, [selectedText, setShowCommentInput, setShowExplanation, handleExplainSelectedText]);

  // Handle comment button click
  const handleCommentClick = useCallback(() => {
    setShowExplanation(false);
    setShowCommentInput(true);
    if (onCommentTriggered && selectedText && locationData) {
      onCommentTriggered({
        text: selectedText,
        pageNumber: currentPage,
        locationData
      });
    }
  }, [selectedText, locationData, currentPage, onCommentTriggered, setShowExplanation, setShowCommentInput]);

  // Handle deleting a comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast({
        title: "Comment deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Failed to delete comment",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  }, [deleteComment]);

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      <DocumentViewerHeader 
        documentVersionUrl={documentVersionUrl}
        commentCount={commentCount}
        showCommentSidebar={showCommentSidebar}
        onToggleCommentSidebar={handleToggleCommentSidebar}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <DocumentViewerContent
          documentContainerRef={documentContainerRef}
          handleMouseUp={handleMouseUp}
          documentVersionUrl={documentVersionUrl}
          showCommentSidebar={showCommentSidebar}
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          showExplanation={showExplanation}
          showCommentInput={showCommentInput}
          aiLoading={aiLoading}
          handleExplainSelectedText={handleExplainClick}
          handleAddComment={handleCommentClick}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          submitting={isAddingComment}
          handleSubmitComment={handleSubmitComment}
          handleCloseCommentInput={handleCloseCommentInput}
          explanationResult={explanationResult}
          handleCloseExplanation={handleCloseExplanation}
        />
        
        {showCommentSidebar && (
          <DocumentCommentsSidebar 
            comments={comments}
            isLoading={isLoadingComments}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </div>
  );
});

DocumentViewerContainer.displayName = 'DocumentViewerContainer';

export default DocumentViewerContainer;
