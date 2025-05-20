
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
    loading: isLoadingComments,
    submitting: isAddingComment,
    addComment,
    deleteComment
  } = useDocumentComments(versionId || '');

  // Calculate comment count
  const commentCount = comments?.length || 0;

  // Use document explanation hook for AI explanation functionality
  const {
    aiLoading,
    handleExplainSelectedText,
    handleCloseExplanation
  } = useDocumentExplanation({
    dealId
  });
  
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
    
    if (!versionId) {
      toast({
        title: "No document version selected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addComment({
        content: commentContent,
        page_number: currentPage,
        location_data: locationData,
        selected_text: selectedText || ""
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
        commentsCount={commentCount}
        showCommentSidebar={showCommentSidebar}
        onToggleCommentSidebar={handleToggleCommentSidebar}
        dealId={dealId}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <DocumentViewerContent
          documentVersionUrl={documentVersionUrl}
          showCommentSidebar={showCommentSidebar}
          documentContainerRef={documentContainerRef}
          handleMouseUp={handleMouseUp}
          documentLoading={false}
          documentError={null}
          setDocumentLoading={() => {}}
          setDocumentError={() => {}}
        />
        
        {showCommentSidebar && (
          <DocumentCommentsSidebar 
            versionId={versionId}
            documentId={documentId}
            dealId={dealId}
            documentViewerRef={ref}
          />
        )}
      </div>
    </div>
  );
});

DocumentViewerContainer.displayName = 'DocumentViewerContainer';

export default DocumentViewerContainer;
