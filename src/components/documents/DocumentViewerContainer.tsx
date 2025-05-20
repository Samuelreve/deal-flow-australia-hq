
import React, { forwardRef, useRef, useState, useCallback } from 'react';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import { useDocumentViewerState } from '@/hooks/useDocumentViewerState';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';
import useDocumentCommentHandler from './DocumentCommentHandler';
import DocumentToolbar from './DocumentToolbar';

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
    handleToggleCommentSidebar
  } = useDocumentViewerState({ documentVersionUrl });
  
  // Use document comments hook for comment functionality
  const { 
    comments,
    loading,
    submitting,
    commentCount,
    handleSubmitComment,
    handleDeleteComment
  } = useDocumentCommentHandler({ versionId });

  // Use document explanation hook for AI explanation functionality
  const {
    aiLoading,
    explanationResult,
    handleExplainSelectedText,
    handleCloseExplanation
  } = useDocumentExplanation({ dealId });
  
  // Handle opening the comment input form
  const handleOpenCommentInput = useCallback(() => {
    setShowExplanation(false);
    setShowCommentInput(true);
  }, [setShowExplanation, setShowCommentInput]);

  // Handle closing the comment input form
  const handleCloseCommentInput = useCallback(() => {
    setShowCommentInput(false);
    clearSelection();
  }, [setShowCommentInput, clearSelection]);

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
      clearSelection();
      
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
    selectedText, 
    setCommentContent, 
    setShowCommentInput, 
    clearSelection, 
    setShowCommentSidebar
  ]);

  // Handle explain button click
  const handleExplainClick = useCallback(() => {
    setShowCommentInput(false);
    setShowExplanation(true);
    handleExplainSelectedText(selectedText);
  }, [
    selectedText, 
    setShowCommentInput, 
    setShowExplanation, 
    handleExplainSelectedText
  ]);

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
    onCommentTriggered, 
    setShowExplanation, 
    setShowCommentInput
  ]);

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
        
        <DocumentToolbar
          showExplanation={showExplanation}
          showCommentInput={showCommentInput}
          selectedText={selectedText}
          aiLoading={aiLoading}
          onExplainClick={handleExplainClick}
          onAddCommentClick={handleAddComment}
          buttonPosition={buttonPosition}
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
