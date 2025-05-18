
import React from 'react';
import DocumentSelectionActions from './DocumentSelectionActions';
import DocumentCommentInput from './DocumentCommentInput';

interface DocumentContentProps {
  documentContainerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  documentVersionUrl: string;
  showCommentSidebar: boolean;
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  showExplanation: boolean;
  showCommentInput: boolean;
  aiLoading: boolean;
  handleExplainSelectedText: () => void;
  handleAddComment: () => void;
  commentContent: string;
  setCommentContent: (content: string) => void;
  submitting: boolean;
  handleSubmitComment: () => void;
  handleCloseCommentInput: () => void;
}

const DocumentContent: React.FC<DocumentContentProps> = ({
  documentContainerRef,
  handleMouseUp,
  documentVersionUrl,
  showCommentSidebar,
  selectedText,
  buttonPosition,
  showExplanation,
  showCommentInput,
  aiLoading,
  handleExplainSelectedText,
  handleAddComment,
  commentContent,
  setCommentContent,
  submitting,
  handleSubmitComment,
  handleCloseCommentInput,
}) => {
  const [documentLoading, setDocumentLoading] = React.useState(true);
  const [documentError, setDocumentError] = React.useState<string | null>(null);

  // Effect to simulate document loading
  React.useEffect(() => {
    // Simulate document loading process
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

  return (
    <div
      ref={documentContainerRef}
      onMouseUp={handleMouseUp}
      className={`flex-1 overflow-y-auto border rounded-lg p-4 bg-white shadow-sm relative ${showCommentSidebar ? 'w-2/3' : 'w-full'}`}
      style={{ minHeight: '400px' }}
    >
      {/* Loading state */}
      {documentLoading && (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground animate-pulse">Loading document...</p>
        </div>
      )}

      {/* Error state */}
      {documentError && (
        <div className="flex justify-center items-center h-full">
          <p className="text-destructive">Error loading document: {documentError}</p>
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

      {/* Selection action buttons */}
      {selectedText && buttonPosition && !showExplanation && !showCommentInput && !aiLoading && (
        <DocumentSelectionActions
          buttonPosition={buttonPosition}
          onExplain={handleExplainSelectedText}
          onAddComment={handleAddComment}
        />
      )}

      {/* Comment input form */}
      {showCommentInput && (
        <DocumentCommentInput
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          submitting={submitting}
          onSubmit={handleSubmitComment}
          onClose={handleCloseCommentInput}
        />
      )}
    </div>
  );
};

export default DocumentContent;
