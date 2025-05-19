
import React from 'react';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import { DocumentViewerRef } from './DocumentViewer';

interface DocumentSidebarContainerProps {
  showSidebar: boolean;
  versionId?: string;
  documentId?: string;
  dealId?: string;
  documentViewerRef: React.RefObject<DocumentViewerRef>;
  onCommentClick?: (commentId: string, locationData: any) => void;
  onSidebarToggle?: () => void;
}

const DocumentSidebarContainer: React.FC<DocumentSidebarContainerProps> = ({
  showSidebar,
  versionId,
  documentId,
  dealId,
  documentViewerRef,
  onCommentClick,
  onSidebarToggle
}) => {
  if (!showSidebar) {
    return null;
  }

  return (
    <DocumentCommentsSidebar 
      versionId={versionId}
      documentId={documentId}
      dealId={dealId}
      documentViewerRef={documentViewerRef}
      onCommentClick={onCommentClick}
      onSidebarToggle={onSidebarToggle}
    />
  );
};

export default DocumentSidebarContainer;
