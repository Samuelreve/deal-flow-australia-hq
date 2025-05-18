
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { useDocumentComments } from '@/hooks/documentComments';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, MessageSquare, MessageSquarePlus } from 'lucide-react';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentVersionUrl: string; // The secure URL of the document version file
  dealId: string; // The ID of the deal
  documentId?: string; // The ID of the logical document (optional for AI context)
  versionId?: string; // The ID of the specific document version (optional for AI context)
  // Add other props if needed (e.g., initialPage, onPageChange)
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentVersionUrl,
  dealId,
  documentId,
  versionId,
  onCommentTriggered,
}) => {
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

  // State to manage the selected text by the user
  const [selectedText, setSelectedText] = useState<string | null>(null);
  // State to manage the position of interaction buttons
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  // State to control visibility of the AI explanation display
  const [showExplanation, setShowExplanation] = useState(false);
  // State to store the AI explanation result for display
  const [explanationResult, setExplanationResult] = useState<{ explanation?: string; disclaimer: string } | null>(null);
  // State for comment input visibility and content
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  // State to track current page number
  const [currentPage, setCurrentPage] = useState(1);
  // State to store location data of the selection
  const [locationData, setLocationData] = useState<any>(null);
  // State to control comment sidebar visibility
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  // Conceptual Document Viewer State
  const [numPages, setNumPages] = useState<number | null>(null);

  // Refs for the document container and comment input
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Document viewer state
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

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

  // Handle text selection and button positioning
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0 && documentContainerRef.current?.contains(selection?.anchorNode as Node || null)) {
      // Text is selected within the document container
      setSelectedText(text);

      // Try to get the bounding rectangle of the selection
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const containerRect = documentContainerRef.current.getBoundingClientRect();

        // Position the button below and to the right of the selection
        setButtonPosition({
          top: rect.bottom - containerRect.top + 5, // 5px below selection
          left: rect.left - containerRect.left + (rect.width / 2), // Center horizontally
        });

        // Store location data for the selection
        setLocationData({
          pageNumber: currentPage,
          rect: {
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left,
            width: rect.width,
            height: rect.height,
          },
          quote: text,
          context: range.startContainer.textContent?.substring(
            Math.max(0, range.startOffset - 50), 
            range.startOffset
          ) + text + range.startContainer.textContent?.substring(
            range.endOffset, 
            Math.min(range.endOffset + 50, (range.startContainer.textContent || '').length)
          ),
          selectedText: text
        });
      } else {
        setButtonPosition(null);
        setLocationData(null);
      }
    } else {
      // No text selected or selection is outside the document container
      setSelectedText(null);
      setButtonPosition(null);
      setLocationData(null);
      
      // Don't hide the explanation or comment input if they're showing
      if (!showExplanation && !showCommentInput) {
        setExplanationResult(null);
      }
    }
  }, [showExplanation, showCommentInput, currentPage]);

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

    // Focus the comment input when it appears
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);

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

  // Effect to update explanationResult when hook's result changes
  useEffect(() => {
    if (result) {
      setExplanationResult(result);
    }
  }, [result]);

  // Toggle comment sidebar
  const handleToggleCommentSidebar = () => {
    setShowCommentSidebar(prev => !prev);
  };

  // Effect to clear selection when documentVersionUrl changes
  useEffect(() => {
    setSelectedText(null);
    setButtonPosition(null);
    setLocationData(null);
    setCurrentPage(1);
    setShowExplanation(false);
    setShowCommentInput(false);
    setDocumentLoading(true);
    setDocumentError(null);
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

          {/* Interaction buttons - positioned near selection */}
          {selectedText && buttonPosition && !showExplanation && !showCommentInput && !aiLoading && (
            <div
              className="absolute z-10 flex gap-2"
              style={{ 
                top: `${buttonPosition.top}px`, 
                left: `${buttonPosition.left}px`,
                transform: 'translateX(-50%)' // Center horizontally
              }}
            >
              <Button
                onClick={handleExplainSelectedText}
                className="text-xs"
                size="sm"
              >
                Explain
              </Button>
              <Button
                onClick={handleAddComment}
                className="text-xs"
                size="sm"
                variant="secondary"
              >
                <MessageSquarePlus className="mr-1 h-3 w-3" /> Comment
              </Button>
            </div>
          )}

          {/* Comment input form */}
          {showCommentInput && (
            <div className="absolute z-20 bg-background border rounded-lg shadow-lg p-4 w-80"
                 style={{ 
                   top: buttonPosition ? `${buttonPosition.top}px` : '50%', 
                   left: buttonPosition ? `${buttonPosition.left}px` : '50%',
                   transform: buttonPosition ? 'translateX(-50%)' : 'translate(-50%, -50%)'
                 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Add Comment</h4>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCloseCommentInput}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedText && (
                <div className="bg-muted p-2 rounded-sm mb-2 text-xs italic">
                  {selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}
                </div>
              )}
              
              <Textarea 
                ref={commentInputRef}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Type your comment here..."
                className="min-h-[100px] mb-2"
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentContent.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : 'Save Comment'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Comments sidebar */}
        {showCommentSidebar && (
          <div className="w-1/3 border rounded-lg overflow-y-auto bg-background p-4">
            <h3 className="font-medium mb-4">Document Comments</h3>
            
            {commentsLoading ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading comments...</span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-md p-3 bg-card">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{comment.user?.name || 'User'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {comment.locationData?.selectedText && (
                      <div className="mt-1 text-xs italic bg-muted p-2 rounded">
                        "{comment.locationData.selectedText}"
                      </div>
                    )}
                    
                    <div className="mt-2">{comment.content}</div>
                    
                    {comment.pageNumber && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Page {comment.pageNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet for this document.
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Explanation Display */}
      {showExplanation && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold">AI Explanation</h4>
            <Button
              onClick={handleCloseExplanation}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {aiLoading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting explanation...
            </div>
          ) : explanationResult ? (
            <div>
              <p className="text-foreground">{explanationResult.explanation}</p>
              {explanationResult.disclaimer && (
                <p className="text-sm text-muted-foreground italic mt-2">{explanationResult.disclaimer}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Select text in the document to get an explanation.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
