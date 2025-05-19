
import React, { useEffect, useRef } from 'react';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import DocumentAIExplanation from './DocumentAIExplanation';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentViewerHeader from './DocumentViewerHeader';
import { useDocumentViewerState } from '@/hooks/useDocumentViewerState';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';
import { useDocumentCommentHandling } from '@/hooks/useDocumentCommentHandling';

// Define props for the DocumentViewerContainer component
interface DocumentViewerContainerProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

const DocumentViewerContainer: React.FC<DocumentViewerContainerProps> = ({
  documentVersionUrl,
  dealId,
  documentId,
  versionId,
  onCommentTriggered,
}) => {
  // Use our custom hooks to manage state and functionality
  const {
    currentPage,
    showCommentSidebar,
    showExplanation,
    setShowExplanation,
    handleToggleCommentSidebar
  } = useDocumentViewerState({ documentVersionUrl });

  const {
    aiLoading,
    explanationResult,
    handleExplainSelectedText,
    handleCloseExplanation
  } = useDocumentExplanation({ dealId });

  const {
    comments,
    commentContent,
    setCommentContent,
    showCommentInput,
    submitting,
    activeCommentId,
    setActiveCommentId,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput,
    setShowCommentInput
  } = useDocumentCommentHandling({ versionId });

  const {
    selectedText,
    buttonPosition,
    locationData,
    documentContainerRef,
    handleMouseUp,
    clearSelection,
    setSelectedText,
    setButtonPosition,
  } = useDocumentSelection(currentPage);

  // Reference to expose highlightLocation method
  const viewerRef = useRef({
    highlightLocation: (locationData: any) => {
      console.log('Highlight location:', locationData);
      // Implementation would depend on your document viewer capabilities
      // This could involve scrolling to a specific position and highlighting text
    }
  });

  // Handle triggering AI explanation
  const handleExplainClick = () => {
    if (!selectedText || aiLoading) return;

    setButtonPosition(null);
    setShowExplanation(true);
    handleExplainSelectedText(selectedText);
  };

  // Handle opening comment input
  const handleCommentClick = () => {
    setButtonPosition(null);
    handleAddComment(selectedText, locationData, currentPage);

    if (onCommentTriggered && locationData) {
      onCommentTriggered({
        text: selectedText || '',
        pageNumber: locationData.pageNumber || currentPage,
        locationData: locationData
      });
    }
  };

  // Handle submitting a comment
  const handleCommentSubmit = async () => {
    // Here's the issue - we need to fix this line to match the expected parameters
    // or adjust it to not pass any parameters if the function doesn't accept any
    await handleSubmitComment();
  };

  // Handle comment sidebar item click
  const handleSidebarCommentClick = (commentId: string, commentLocationData: any) => {
    setActiveCommentId(commentId);
    console.log(`Clicked comment ${commentId} with location:`, commentLocationData);
    // Future implementation: highlight the text in the document
  };

  // Effect to clear selection when clicking outside the button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (documentContainerRef.current && !documentContainerRef.current.contains(event.target as Node)) {
        const commentInput = document.getElementById('comment-input-container');
        const explanationDisplay = document.getElementById('explanation-display');
        
        if (
          (!commentInput || !commentInput.contains(event.target as Node)) && 
          (!explanationDisplay || !explanationDisplay.contains(event.target as Node))
        ) {
          if (!showCommentInput && !showExplanation) {
            setSelectedText(null);
            setButtonPosition(null);
          }
        }
      }
    };

    document.body.addEventListener('click', handleClickOutside);
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [documentContainerRef, showCommentInput, showExplanation, setSelectedText, setButtonPosition]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <DocumentViewerHeader 
        commentsCount={comments.length} 
        onToggleCommentSidebar={handleToggleCommentSidebar} 
      />

      <div className="flex flex-1 gap-4">
        <DocumentViewerContent
          documentContainerRef={documentContainerRef}
          handleMouseUp={handleMouseUp}
          documentVersionUrl={documentVersionUrl}
          showCommentSidebar={showCommentSidebar}
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          aiLoading={aiLoading}
          showCommentInput={showCommentInput}
          setShowCommentInput={setShowCommentInput}
          documentLoading={false}
          documentError={null}
          setDocumentLoading={() => {}}
          setDocumentError={() => {}}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
          onCommentPosted={() => {}}
          onCommentCancel={() => {}}
          submitting={submitting}
          onExplainClick={handleExplainClick}
          onCommentClick={handleCommentClick}
          onCommentChange={setCommentContent}
          onCommentSubmit={handleCommentSubmit}
          onCommentClose={handleCloseCommentInput}
          commentContent={commentContent}
        />

        {showCommentSidebar && (
          <DocumentCommentsSidebar 
            versionId={versionId}
            documentId={documentId}
            dealId={dealId}
            documentViewerRef={viewerRef}
            onCommentClick={handleSidebarCommentClick}
            onSidebarToggle={handleToggleCommentSidebar}
          />
        )}
      </div>

      {showExplanation && (
        <DocumentAIExplanation
          loading={aiLoading}
          explanationResult={explanationResult}
          onClose={handleCloseExplanation}
        />
      )}
    </div>
  );
};

export default DocumentViewerContainer;
