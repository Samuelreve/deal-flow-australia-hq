
import React from 'react';
import DocumentViewerContent from './DocumentViewerContent';
import { useDocumentContentArea } from '@/hooks/useDocumentContentArea';
import { useDocumentViewerRef } from '@/hooks/useDocumentViewerRef';

interface DocumentContentAreaProps {
  documentVersionUrl: string;
  showCommentSidebar: boolean;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  onMouseUp: () => void;
  forwardedRef: React.ForwardedRef<any>;
}

const DocumentContentArea: React.FC<DocumentContentAreaProps> = ({
  documentVersionUrl,
  showCommentSidebar,
  dealId,
  documentId,
  versionId,
  onMouseUp,
  forwardedRef
}) => {
  // Use our custom hooks to manage the document area
  const { documentContainerRef, highlightRef } = useDocumentContentArea();
  
  // Setup viewer refs
  const internalDocumentViewerRef = useDocumentViewerRef(highlightRef, forwardedRef);

  return (
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
  );
};

export default DocumentContentArea;
