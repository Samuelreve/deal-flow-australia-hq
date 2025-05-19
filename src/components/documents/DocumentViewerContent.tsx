
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DocumentSelectionControls from './DocumentSelectionControls';
import DocumentCommentForm from './DocumentCommentForm';

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
}) => {
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Effect to simulate document loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (documentVersionUrl) {
        setDocumentLoading(false);
      } else {
        setDocumentError('No document URL provided');
        setDocumentLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [documentVersionUrl]);

  const containerWidthClass = showCommentSidebar ? 'w-2/3' : 'w-full';

  return (
    <div
      ref={documentContainerRef}
      onMouseUp={handleMouseUp}
      className={`flex-1 overflow-y-auto border rounded-lg p-4 bg-white shadow-sm relative ${containerWidthClass}`}
      style={{ minHeight: '400px' }}
    >
      {/* Loading state */}
      {documentLoading && (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading document...</span>
        </div>
      )}

      {/* Error state */}
      {documentError && (
        <div className="flex justify-center items-center h-full text-destructive">
          <p>Error loading document: {documentError}</p>
        </div>
      )}

      {/* Document content */}
      {!documentLoading && !documentError && (
        <div className="h-full">
          <iframe 
            src={documentVersionUrl}
            className="w-full h-full border-0" 
            title="Document Viewer"
            onLoad={() => setDocumentLoading(false)}
            onError={() => {
              setDocumentError('Failed to load document');
              setDocumentLoading(false);
            }}
          />
        </div>
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
        />
      )}
    </div>
  );
};

export default DocumentViewerContent;
