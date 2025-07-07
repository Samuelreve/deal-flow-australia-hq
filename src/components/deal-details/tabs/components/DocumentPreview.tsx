import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

interface DocumentPreviewProps {
  documentPreview: string;
  previewLoading: boolean;
  onOpenDocumentInNewTab: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentPreview,
  previewLoading,
  onOpenDocumentInNewTab,
}) => {
  // Function to safely convert any value to readable text
  const getDisplayText = (content: string): string => {
    if (!content) return '';
    
    // If it's already a string, return it
    if (typeof content === 'string') {
      // Check if it's a stringified object that starts with { or [
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // If JSON parsing fails, return as is
          return content;
        }
      }
      return content;
    }
    
    // If it's an object, stringify it
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content, null, 2);
    }
    
    // For any other type, convert to string
    return String(content);
  };

  const displayText = getDisplayText(documentPreview);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 12px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgb(229 231 235);
            border-radius: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(156 163 175);
            border-radius: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(107 114 128);
          }
        `
      }} />
      <div className="flex-1 bg-muted/20 rounded border flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-background/50 flex-shrink-0">
          <h4 className="font-medium text-sm">Document Preview</h4>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0"
            onClick={onOpenDocumentInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {previewLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          </div>
        ) : displayText ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Text Content */}
            <div 
              className="overflow-y-scroll overflow-x-hidden p-4 bg-background/30 rounded border custom-scrollbar"
              style={{
                height: 'calc(600px - 140px)', // Further reduced footer space
                maxHeight: 'calc(600px - 140px)',
                scrollbarWidth: 'auto',
                scrollbarColor: 'rgb(156 163 175) rgb(229 231 235)'
              }}
            >
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground break-words">
                {displayText}
              </pre>
            </div>
            
            {/* Footer - Ultra Compact */}
            <div className="flex-shrink-0 px-2 border-t bg-muted/20" style={{ height: '18px', display: 'flex', alignItems: 'center' }}>
              <p className="text-xs text-muted-foreground text-center leading-none w-full" style={{ fontSize: '11px' }}>
                Extracted text preview • Click the button above to open the full document
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No Preview Available</p>
              <p className="text-sm text-muted-foreground">
                Select a document to view its content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default DocumentPreview;