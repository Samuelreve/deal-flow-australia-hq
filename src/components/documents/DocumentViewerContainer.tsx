
import React, { useState, useEffect } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { useDocumentComments } from '@/hooks/documentComments';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import DocumentAIExplanation from './DocumentAIExplanation';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import DocumentViewerContent from './DocumentViewerContent';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

// Define props for the DocumentViewerContainer component
interface DocumentViewerContainerProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

const DocumentViewerContainer: React.FC<DocumentViewerContainerProps> = ({
  documentVersionUrl,
  dealId,
  documentId,
  versionId,
  onCommentTriggered,
}) => {
  // Document viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [explanationResult, setExplanationResult] = useState<{ explanation?: string; disclaimer: string } | null>(null);

  // Use hooks for functionality
  const { explainClause, loading: aiLoading, result, error, clearResult } = useDocumentAI({
    dealId,
  });

  const { 
    comments, 
    loading: commentsLoading, 
    submitting,
    addComment,
  } = useDocumentComments(versionId);

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

  // Handle triggering AI explanation
  const handleExplainSelectedText = async () => {
    if (!selectedText || aiLoading) return;

    setButtonPosition(null);
    setShowExplanation(true);
    setShowCommentInput(false);
    setExplanationResult(null);

    try {
      const result = await explainClause(selectedText);
      setExplanationResult(result || { explanation: 'Could not get explanation.', disclaimer: 'Failed to retrieve explanation.' });
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

  // Handle comment click in sidebar
  const handleCommentClick = (commentId: string, commentLocationData: any) => {
    console.log(`Clicked comment ${commentId} with location:`, commentLocationData);
    // Future implementation: highlight the text in the document
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
  }, [documentVersionUrl, clearSelection]);

  // Effect to clear selection when clicking outside the button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (documentContainerRef.current && !documentContainerRef.current.contains(event.target as Node)) {
        const commentInput = document.getElementById('comment-input-container');
        const explanationDisplay = document.getElementById('explanation-display');
        
        if (
          (!commentInput || !commentInput.contains(event.target as Node)) && 
          (!explanationDisplay || !explanationDisplay.contains(event.target as Node))
        ) {
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
        <DocumentViewerContent
          documentContainerRef={documentContainerRef}
          handleMouseUp={handleMouseUp}
          documentVersionUrl={documentVersionUrl}
          showCommentSidebar={showCommentSidebar}
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          aiLoading={aiLoading}
          showCommentInput={showCommentInput}
          commentContent={commentContent}
          submitting={submitting}
          onExplainClick={handleExplainSelectedText}
          onCommentClick={handleAddComment}
          onCommentChange={setCommentContent}
          onCommentSubmit={handleSubmitComment}
          onCommentClose={handleCloseCommentInput}
        />

        {showCommentSidebar && (
          <DocumentCommentsSidebar 
            versionId={versionId}
            onCommentClick={handleCommentClick} 
          />
        )}
      </div>

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

export default DocumentViewerContainer;
