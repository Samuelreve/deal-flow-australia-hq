
import React, { useRef } from 'react';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import { DocumentViewerRef } from './DocumentViewer';
import { useDocumentHighlighting } from '@/hooks/useDocumentHighlighting';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import { useDocumentCommentSidebar } from '@/hooks/useDocumentCommentSidebar';

interface DocumentViewerContentContainerProps {
  documentVersionUrl: string;
  showCommentSidebar: boolean;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  currentPage: number;
  onMouseUp: () => void;
  ref: React.ForwardedRef<DocumentViewerRef>;
  onCommentClick?: (commentId: string, locationData: any) => void;
  onToggleSidebar?: () => void;
}

const DocumentViewerContentContainer: React.FC<DocumentViewerContentContainerProps> = ({
  documentVersionUrl,
  showCommentSidebar,
  dealId,
  documentId,
  versionId,
  currentPage,
  onMouseUp,
  ref,
  onCommentClick,
  onToggleSidebar
}) => {
  // Document container ref
  const documentContainerRef = useRef<HTMLDivElement>(null);
  
  // Setup highlighting and viewer refs
  const highlightRef = useDocumentHighlighting(documentContainerRef);
  const internalDocumentViewerRef = useDocumentViewerRef(highlightRef, ref);
  
  // Set up comment sidebar handling
  const {
    activeCommentId,
    handleCommentClick: handleSidebarCommentClick
  } = useDocumentCommentSidebar(internalDocumentViewerRef);

  return (
    <div className="flex flex-1 gap-4">
      <DocumentViewerContent
        documentContainerRef={documentContainerRef}
        handleMouseUp={onMouseUp}
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
          onCommentClick={onCommentClick || handleSidebarCommentClick}
          onSidebarToggle={onToggleSidebar}
        />
      )}
    </div>
  );
};

export default DocumentViewerContentContainer;
