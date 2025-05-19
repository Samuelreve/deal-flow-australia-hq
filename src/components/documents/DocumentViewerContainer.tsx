
import React, { useEffect, useRef, forwardRef } from 'react';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import DocumentAIExplanation from './DocumentAIExplanation';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentSelectionOverlay from './DocumentSelectionOverlay';
import { useDocumentViewerState } from '@/hooks/useDocumentViewerState';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';
import { useDocumentCommentHandling } from '@/hooks/useDocumentCommentHandling';
import { DocumentViewerRef } from './DocumentViewer';
import { useDocumentHighlighting } from '@/hooks/useDocumentHighlighting';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';

// Define props for the DocumentViewerContainer component
interface DocumentViewerContainerProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

const DocumentViewerContainer = forwardRef<DocumentViewerRef, DocumentViewerContainerProps>((
  {
    documentVersionUrl,
    dealId,
    documentId,
    versionId,
    onCommentTriggered,
  },
  ref
) => {
  // Document container ref
  const documentContainerRef = useRef<HTMLDivElement>(null);
  
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
    handleMouseUp,
    clearSelection,
    setSelectedText,
    setButtonPosition,
  } = useDocumentSelection(currentPage);

  // Use the highlighting hook
  const highlightRef = useDocumentHighlighting(documentContainerRef);
  
  // Setup document viewer ref
  const internalDocumentViewerRef = useDocumentViewerRef(highlightRef, ref);

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
    await handleSubmitComment();
  };

  // Handle comment sidebar item click
  const handleSidebarCommentClick = (commentId: string, commentLocationData: any) => {
    setActiveCommentId(commentId);
    highlightRef.current.highlightLocation(commentLocationData);
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
          documentLoading={false}
          documentError={null}
          setDocumentLoading={() => {}}
          setDocumentError={() => {}}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
          onCommentPosted={() => {}}
        />

        {showCommentSidebar && (
          <DocumentCommentsSidebar 
            versionId={versionId}
            documentId={documentId}
            dealId={dealId}
            documentViewerRef={internalDocumentViewerRef}
            onCommentClick={handleSidebarCommentClick}
            onSidebarToggle={handleToggleCommentSidebar}
          />
        )}
      </div>
      
      <DocumentSelectionOverlay
        selectedText={selectedText}
        buttonPosition={buttonPosition}
        aiLoading={aiLoading}
        showCommentInput={showCommentInput}
        dealId={dealId}
        documentId={documentId}
        versionId={versionId}
        onExplainClick={handleExplainClick}
        onCommentClick={handleCommentClick}
        onCommentSubmit={handleCommentSubmit}
        onCommentClose={handleCloseCommentInput}
        onCommentChange={setCommentContent}
        commentContent={commentContent}
        submitting={submitting}
        onCommentPosted={() => {}}
        onCommentCancel={handleCloseCommentInput}
      />

      {showExplanation && (
        <DocumentAIExplanation
          loading={aiLoading}
          explanationResult={explanationResult}
          onClose={handleCloseExplanation}
        />
      )}
    </div>
  );
});

DocumentViewerContainer.displayName = 'DocumentViewerContainer';

export default DocumentViewerContainer;
