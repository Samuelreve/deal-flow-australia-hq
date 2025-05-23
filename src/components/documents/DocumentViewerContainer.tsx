
import React, { forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';
import { useDocumentInteractions } from '@/hooks/useDocumentInteractions';
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
  
  // Use document interactions hook for UI state and actions
  const {
    showExplanation,
    showCommentInput,
    showCommentSidebar,
    setShowCommentSidebar,
    commentContent,
    setCommentContent,
    commentsLoading,
    submitting,
    commentCount,
    aiLoading,
    handleExplainClick,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput,
    handleToggleCommentSidebar
  } = useDocumentInteractions({
    versionId,
    dealId,
    selectedText,
    locationData,
    currentPage,
    onCommentTriggered
  });
  
  // Notify parent when text is selected
  useEffect(() => {
    if (onTextSelected) {
      onTextSelected(selectedText);
    }
  }, [selectedText, onTextSelected]);

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
