
import React from 'react';
import DocumentContentArea from './DocumentContentArea';
import DocumentSidebarContainer from './DocumentSidebarContainer';
import { DocumentViewerRef } from './DocumentViewer';
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
  onMouseUp,
  ref,
  onCommentClick,
  onToggleSidebar
}) => {
  // Set up comment sidebar handling
  const {
    activeCommentId,
    handleCommentClick: handleSidebarCommentClick
  } = useDocumentCommentSidebar(ref);

  return (
    <div className="flex flex-1 gap-4">
      <DocumentContentArea
        documentVersionUrl={documentVersionUrl}
        showCommentSidebar={showCommentSidebar}
        dealId={dealId}
        documentId={documentId}
        versionId={versionId}
        onMouseUp={onMouseUp}
        forwardedRef={ref}
      />

      <DocumentSidebarContainer
        showSidebar={showCommentSidebar}
        versionId={versionId}
        documentId={documentId}
        dealId={dealId}
        documentViewerRef={ref as React.RefObject<DocumentViewerRef>}
        onCommentClick={onCommentClick || handleSidebarCommentClick}
        onSidebarToggle={onToggleSidebar}
      />
    </div>
  );
};

export default DocumentViewerContentContainer;
