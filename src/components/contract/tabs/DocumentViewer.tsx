
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import HighlightNoteEditor from '../HighlightNoteEditor';
import { Highlight } from '@/hooks/contract-analysis/types';

interface DocumentViewerProps {
  contractText: string;
  isHighlightMode: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  highlights: Highlight[];
  selectedHighlight: Highlight | null;
  highlightNote: string;
  showNoteEditor: boolean;
  handleTextSelection: () => void;
  selectHighlight: (id: string) => void;
  setHighlightNote: (note: string) => void;
  updateHighlightNote: (id: string, note: string) => void;
  setShowNoteEditor: (show: boolean) => void;
  renderHighlightedText: () => string;
  categories: any[];
  activeCategory: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  contractText,
  isHighlightMode,
  containerRef,
  highlights,
  selectedHighlight,
  highlightNote,
  showNoteEditor,
  handleTextSelection,
  selectHighlight,
  setHighlightNote,
  updateHighlightNote,
  setShowNoteEditor,
  renderHighlightedText,
  categories,
  activeCategory
}) => {
  const [expanded, setExpanded] = useState(false);
  const maxHeight = expanded ? '100%' : '600px';
  
  // Prepare highlighted HTML content
  const highlightedContent = renderHighlightedText();
  
  return (
    <>
      {showNoteEditor && selectedHighlight && (
        <HighlightNoteEditor
          highlight={selectedHighlight}
          note={highlightNote}
          onNoteChange={setHighlightNote}
          onSave={updateHighlightNote}
          onClose={() => setShowNoteEditor(false)}
        />
      )}
      
      {contractText ? (
        <>
          <div 
            className="bg-muted p-4 rounded-md overflow-auto transition-all" 
            style={{ maxHeight }}
            ref={containerRef}
            onMouseUp={handleTextSelection}
          >
            {isHighlightMode && (
              <div className="p-2 mb-2 text-xs bg-blue-50 rounded border border-blue-100">
                <p className="font-medium">Highlight Mode Active</p>
                <p>Select any text in the document to highlight it as <span className="font-medium">{categories.find(c => c.id === activeCategory)?.name}</span>.</p>
              </div>
            )}
            
            {highlightedContent ? (
              <div 
                className="text-sm whitespace-pre-wrap font-mono text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                onClick={(e) => {
                  // Check if we clicked on a highlight
                  if (e.target instanceof HTMLElement) {
                    const element = e.target as HTMLElement;
                    if (element.hasAttribute('data-highlight-id')) {
                      const highlightId = element.getAttribute('data-highlight-id');
                      if (highlightId) {
                        selectHighlight(highlightId);
                      }
                    }
                  }
                }}
              />
            ) : (
              <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                {contractText}
              </pre>
            )}
          </div>
          
          {contractText.length > 500 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 w-full flex items-center justify-center"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> Show More
                </>
              )}
            </Button>
          )}
        </>
      ) : (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            No document content available. Please upload a document to view its contents.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default DocumentViewer;
