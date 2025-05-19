
import React from 'react';
import DocumentSelectionControls from './DocumentSelectionControls';
import DocumentCommentForm from './DocumentCommentForm';
import DocumentLoadingState from './DocumentLoadingState';
import DocumentErrorState from './DocumentErrorState';
import DocumentIframe from './DocumentIframe';
import { useDocumentLoader } from '@/hooks/useDocumentLoader';

interface DocumentViewerContentProps {
  documentContainerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  documentVersionUrl: string;
  showCommentSidebar: boolean;
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  aiLoading: boolean;
  showCommentInput: boolean;
  commentContent: string;
  submitting: boolean;
  onExplainClick: () => void;
  onCommentClick: () => void;
  onCommentChange: (content: string) => void;
  onCommentSubmit: () => void;
  onCommentClose: () => void;
  locationData?: any;
  pageNumber?: number;
  dealId?: string;
  documentId?: string;
  versionId?: string;
}

const DocumentViewerContent: React.FC<DocumentViewerContentProps> = ({
  documentContainerRef,
  handleMouseUp,
  documentVersionUrl,
  showCommentSidebar,
  selectedText,
  buttonPosition,
  aiLoading,
  showCommentInput,
  commentContent,
  submitting,
  onExplainClick,
  onCommentClick,
  onCommentChange,
  onCommentSubmit,
  onCommentClose,
  locationData,
  pageNumber,
  dealId,
  documentId,
  versionId,
}) => {
  const {
    documentLoading,
    documentError,
    handleDocumentLoad,
    handleDocumentError
  } = useDocumentLoader(documentVersionUrl);

  const containerWidthClass = showCommentSidebar ? 'w-2/3' : 'w-full';

  return (
    <div
      ref={documentContainerRef}
      onMouseUp={handleMouseUp}
      className={`flex-1 overflow-y-auto border rounded-lg p-4 bg-white shadow-sm relative ${containerWidthClass}`}
      style={{ minHeight: '400px' }}
    >
      {/* Loading state */}
      {documentLoading && <DocumentLoadingState />}

      {/* Error state */}
      {documentError && <DocumentErrorState error={documentError} />}

      {/* Document content */}
      {!documentLoading && !documentError && (
        <DocumentIframe 
          documentVersionUrl={documentVersionUrl}
          onLoad={handleDocumentLoad}
          onError={handleDocumentError}
        />
      )}

      {/* Selection controls */}
      <DocumentSelectionControls 
        selectedText={selectedText}
        buttonPosition={buttonPosition}
        aiLoading={aiLoading}
        onExplain={onExplainClick}
        onAddComment={onCommentClick}
      />

      {/* Comment form */}
      {showCommentInput && (
        <DocumentCommentForm 
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          commentContent={commentContent}
          submitting={submitting}
          onCommentChange={onCommentChange}
          onSubmit={onCommentSubmit}
          onClose={onCommentClose}
          pageNumber={pageNumber}
          locationData={locationData}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
        />
      )}
    </div>
  );
};

export default DocumentViewerContent;
