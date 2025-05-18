
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Define props for the DocumentViewer component
interface DocumentViewerProps {
  documentVersionUrl: string; // The secure URL of the document version file
  dealId: string; // The ID of the deal
  documentId?: string; // The ID of the logical document (optional for AI context)
  versionId?: string; // The ID of the specific document version (optional for AI context)
  // Add other props if needed (e.g., initialPage, onPageChange)
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentVersionUrl,
  dealId,
  documentId,
  versionId,
}) => {
  // Use the useDocumentAI hook to access AI functionalities
  const { explainClause, loading, result, error, clearResult } = useDocumentAI({
    dealId,
  });

  // State to manage the selected text by the user
  const [selectedText, setSelectedText] = useState<string | null>(null);
  // State to manage the position of the "Explain Clause" button
  const [explainButtonPosition, setExplainButtonPosition] = useState<{ top: number; left: number } | null>(null);
  // State to control visibility of the AI explanation display
  const [showExplanation, setShowExplanation] = useState(false);
  // State to store the AI explanation result for display
  const [explanationResult, setExplanationResult] = useState<{ explanation?: string; disclaimer: string } | null>(null);

  // Ref for the document container to capture text selections
  const documentContainerRef = useRef<HTMLDivElement>(null);

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
        setExplainButtonPosition({
          top: rect.bottom - containerRect.top + 5, // 5px below selection
          left: rect.right - containerRect.left,
        });
      } else {
        setExplainButtonPosition(null);
      }
    } else {
      // No text selected or selection is outside the document container
      setSelectedText(null);
      setExplainButtonPosition(null);
      
      // Hide the explanation if no text is selected and modal is not open
      if (!showExplanation) {
        setExplanationResult(null);
      }
    }
  }, [showExplanation]);

  // Handle triggering AI explanation
  const handleExplainSelectedText = async () => {
    if (!selectedText || loading) {
      return;
    }

    setExplainButtonPosition(null); // Hide the trigger button immediately
    setShowExplanation(true);
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

  // Handle closing explanation display
  const handleCloseExplanation = () => {
    setShowExplanation(false);
    setExplanationResult(null);
    setSelectedText(null);
    clearResult();
  };

  // Effect to update explanationResult when hook's result changes
  useEffect(() => {
    if (result) {
      setExplanationResult(result);
    }
  }, [result]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Document viewer area */}
      <div
        ref={documentContainerRef}
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-y-auto border rounded-lg p-4 bg-white shadow-sm"
        style={{ minHeight: '400px', position: 'relative' }}
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

        {/* Explain button - positioned near selection */}
        {selectedText && explainButtonPosition && !showExplanation && !loading && (
          <Button
            onClick={handleExplainSelectedText}
            className="absolute z-10 text-xs"
            size="sm"
            style={{ 
              top: `${explainButtonPosition.top}px`, 
              left: `${explainButtonPosition.left}px` 
            }}
          >
            Explain Selected Text
          </Button>
        )}
      </div>

      {/* AI Explanation Display */}
      {showExplanation && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="text-lg font-semibold mb-2">AI Explanation</h4>
          {loading ? (
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
          <div className="flex justify-end mt-3">
            <Button
              onClick={handleCloseExplanation}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
