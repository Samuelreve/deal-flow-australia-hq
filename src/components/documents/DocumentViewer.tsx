import React, { useState, useEffect } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { useDocumentComments } from '@/hooks/documentComments';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import DocumentSelectionActions from './DocumentSelectionActions';
import DocumentCommentInput from './DocumentCommentInput';
import DocumentAIExplanation from './DocumentAIExplanation';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentVersionUrl: string; // The secure URL of the document version file
  dealId: string; // The ID of the deal
  documentId?: string; // The ID of the logical document (optional for AI context)
  versionId?: string; // The ID of the specific document version (optional for AI context)
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentVersionUrl,
  dealId,
  documentId,
  versionId,
  onCommentTriggered,
}) => {
  // Document viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Use the useDocumentAI hook to access AI functionalities
  const { explainClause, loading: aiLoading, result, error, clearResult } = useDocumentAI({
    dealId,
  });

  // Use the useDocumentComments hook for managing comments
  const { 
    comments, 
    loading: commentsLoading, 
    submitting,
    addComment,
  } = useDocumentComments(versionId);

  // Use our custom hook for selection handling
  const {
    selectedText,
    buttonPosition,
    locationData,
    documentContainerRef,
    handleMouseUp,
    clearSelection,
    setSelectedText,
    setButtonPosition,
  } = useDocumentSelection(currentPage);

  // State to control visibility of UI elements
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [explanationResult, setExplanationResult] = useState<{ explanation?: string; disclaimer: string } | null>(null);
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);

  // Handle triggering AI explanation
  const handleExplainSelectedText = async () => {
    if (!selectedText || aiLoading) {
      return;
    }

    setButtonPosition(null); // Hide the trigger button immediately
    setShowExplanation(true);
    setShowCommentInput(false);
    setExplanationResult(null);

    try {
      const result = await explainClause(selectedText);

      if (result) {
        setExplanationResult(result);
      } else {
        setExplanationResult({ explanation: 'Could not get explanation.', disclaimer: 'Failed to retrieve explanation.' });
      }
    } catch (err) {
      console.error('Error explaining clause:', err);
      setExplanationResult({ explanation: 'An error occurred while getting the explanation.', disclaimer: 'Error occurred.' });
    }
  };

  // Handle opening comment input
  const handleAddComment = () => {
    setButtonPosition(null);
    setShowCommentInput(true);
    setShowExplanation(false);

    // If there's an onCommentTriggered prop, call it
    if (onCommentTriggered && locationData) {
      onCommentTriggered({
        text: selectedText || '',
        pageNumber: locationData.pageNumber,
        locationData: locationData
      });
    }
  };

  // Handle submitting a comment
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !versionId) {
      toast({
        title: "Error",
        description: "Please enter a comment and ensure document version is selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addComment({
        content: commentContent,
        pageNumber: locationData?.pageNumber || currentPage,
        locationData: locationData
      });

      // Reset comment UI
      setCommentContent('');
      setShowCommentInput(false);
      
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  // Handle closing explanation display
  const handleCloseExplanation = () => {
    setShowExplanation(false);
    setExplanationResult(null);
    setSelectedText(null);
    clearResult();
  };

  // Handle closing comment input
  const handleCloseCommentInput = () => {
    setShowCommentInput(false);
    setCommentContent('');
  };

  // Toggle comment sidebar
  const handleToggleCommentSidebar = () => {
    setShowCommentSidebar(prev => !prev);
  };

  // Effect to update explanationResult when hook's result changes
  useEffect(() => {
    if (result) {
      setExplanationResult(result);
    }
  }, [result]);

  // Effect to clear selection when documentVersionUrl changes
  useEffect(() => {
    clearSelection();
    setCurrentPage(1);
    setShowExplanation(false);
    setShowCommentInput(false);
    setDocumentLoading(true);
    setDocumentError(null);
  }, [documentVersionUrl, clearSelection]);

  // Effect to clear selection when clicking outside the button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (documentContainerRef.current && !documentContainerRef.current.contains(event.target as Node)) {
        // Don't clear if clicking on the comment or explanation UI
        const commentInput = document.getElementById('comment-input-container');
        const explanationDisplay = document.getElementById('explanation-display');
        
        if (
          (!commentInput || !commentInput.contains(event.target as Node)) && 
          (!explanationDisplay || !explanationDisplay.contains(event.target as Node))
        ) {
          // Only clear selection and buttons if not clicking UI elements we want to keep open
          if (!showCommentInput && !showExplanation) {
            setSelectedText(null);
            setButtonPosition(null);
          }
        }
      }
    };

    document.body.addEventListener('click', handleClickOutside);
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [documentContainerRef, showCommentInput, showExplanation, setSelectedText, setButtonPosition]);

  // Effect to simulate document loading
  useEffect(() => {
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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Document Viewer</h3>
        <Button
          onClick={handleToggleCommentSidebar}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{comments.length} Comments</span>
        </Button>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Document viewer area */}
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

        {/* Comments sidebar */}
        {showCommentSidebar && (
          <DocumentCommentsSidebar comments={comments} loading={commentsLoading} />
        )}
      </div>

      {/* AI Explanation Display */}
      {showExplanation && (
        <DocumentAIExplanation
          loading={aiLoading}
          explanationResult={explanationResult}
          onClose={handleCloseExplanation}
        />
      )}
    </div>
  );
};

export default DocumentViewer;
