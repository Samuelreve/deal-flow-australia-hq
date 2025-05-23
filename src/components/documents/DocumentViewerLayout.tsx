
import React from 'react';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentViewerContentContainer from './DocumentViewerContentContainer';
import DocumentToolbar from './DocumentToolbar';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';

interface DocumentViewerLayoutProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  currentPage: number;
  
  // State from DocumentViewerState
  selectedText: string | null;
  buttonPosition: { x: number; y: number } | null;
  documentContainerRef: React.RefObject<HTMLDivElement>;
  showExplanation: boolean;
  showCommentInput: boolean;
  showCommentSidebar: boolean;
  commentCount: number;
  aiLoading: boolean;
  
  // Handlers
  handleMouseUp: () => void;
  handleExplainClick: () => void;
  handleAddComment: () => void;
  handleToggleCommentSidebar: () => void;
  
  // Ref
  forwardedRef: React.ForwardedRef<any>;
}

const DocumentViewerLayout: React.FC<DocumentViewerLayoutProps> = ({
  documentVersionUrl,
  dealId,
  documentId,
  versionId,
  currentPage,
  selectedText,
  buttonPosition,
  documentContainerRef,
  showExplanation,
  showCommentInput,
  showCommentSidebar,
  commentCount,
  aiLoading,
  handleMouseUp,
  handleExplainClick,
  handleAddComment,
  handleToggleCommentSidebar,
  forwardedRef
}) => {
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
        <DocumentViewerContentContainer
          documentVersionUrl={documentVersionUrl}
          showCommentSidebar={showCommentSidebar}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
          currentPage={currentPage}
          onMouseUp={handleMouseUp}
          ref={forwardedRef}
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
            documentViewerRef={forwardedRef}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewerLayout;
