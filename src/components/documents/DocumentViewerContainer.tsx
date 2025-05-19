
import React, { useRef, forwardRef } from 'react';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import DocumentAIExplanation from './DocumentAIExplanation';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentSelectionOverlay from './DocumentSelectionOverlay';
import { useDocumentViewerState } from '@/hooks/useDocumentViewerState';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';
import { useDocumentCommentHandling } from '@/hooks/useDocumentCommentHandling';
import { DocumentViewerRef } from './DocumentViewer';
import { useDocumentHighlighting } from '@/hooks/useDocumentHighlighting';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';
import { useDocumentSelectionState } from '@/hooks/useDocumentSelectionState';
import DocumentViewerContentContainer from './DocumentViewerContentContainer';

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

  // Set up selection state
  useDocumentSelectionState(
    documentContainerRef,
    showCommentInput,
    showExplanation,
    setSelectedText,
    setButtonPosition
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <DocumentViewerHeader 
        commentsCount={comments.length} 
        onToggleCommentSidebar={handleToggleCommentSidebar} 
      />

      <DocumentViewerContentContainer 
        documentVersionUrl={documentVersionUrl}
        showCommentSidebar={showCommentSidebar}
        dealId={dealId}
        documentId={documentId}
        versionId={versionId}
        currentPage={currentPage}
        onMouseUp={handleMouseUp}
        ref={ref}
        onCommentClick={handleSidebarCommentClick}
        onToggleSidebar={handleToggleCommentSidebar}
      />
      
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
