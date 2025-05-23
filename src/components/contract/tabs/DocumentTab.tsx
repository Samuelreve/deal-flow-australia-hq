
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle, FileText, Highlighter } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentHighlighting } from '@/hooks/contract-analysis/useDocumentHighlighting';

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  const [expanded, setExpanded] = useState(false);
  const maxHeight = expanded ? '100%' : '600px';
  
  // Use our new document highlighting hook
  const {
    containerRef,
    isHighlightMode,
    activeColor,
    highlightConfig,
    handleTextSelection,
    toggleHighlightMode,
    changeHighlightColor,
    clearHighlights,
    renderHighlightedText
  } = useDocumentHighlighting(contractText);
  
  // Prepare highlighted HTML content
  const highlightedContent = renderHighlightedText();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Full Document
        </CardTitle>
      </CardHeader>
      
      {contractText && (
        <div className="px-6 pb-2 flex flex-wrap items-center gap-2">
          <Button
            variant={isHighlightMode ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={toggleHighlightMode}
          >
            <Highlighter className="h-4 w-4" />
            {isHighlightMode ? "Exit Highlight Mode" : "Highlight Text"}
          </Button>
          
          {isHighlightMode && (
            <>
              <div className="flex items-center gap-1 ml-2">
                {highlightConfig.colors.map(color => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full transition-transform ${activeColor === color ? 'scale-125 ring-2 ring-offset-1 ring-black' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => changeHighlightColor(color)}
                    title={`Use ${color} highlight`}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHighlights}
                className="ml-auto text-xs"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      )}
      
      <CardContent>
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
                  <p>Select any text in the document to highlight it.</p>
                </div>
              )}
              
              {highlightedContent ? (
                <div 
                  className="text-sm whitespace-pre-wrap font-mono text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: highlightedContent }}
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
      </CardContent>
    </Card>
  );
};

export default DocumentTab;
