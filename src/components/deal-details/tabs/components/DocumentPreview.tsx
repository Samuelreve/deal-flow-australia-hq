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
  return (
    <div className="flex-1 bg-muted/20 rounded border mr-4 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <h4 className="font-medium">Document Preview</h4>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={onOpenDocumentInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {previewLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : documentPreview ? (
          <div className="h-full">
            {/* Check if documentPreview is a URL (starts with http) */}
            {documentPreview.startsWith('http') ? (
              <div className="h-full flex flex-col">
                <iframe
                  src={documentPreview}
                  className="w-full flex-1 border rounded"
                  style={{ minHeight: '400px' }}
                  title="Document Preview"
                  onError={() => {
                    console.error('Iframe failed to load document');
                  }}
                />
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Document preview • Use the button above to open in new tab
                  </p>
                </div>
              </div>
            ) : (
              /* Text content display */
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="text-sm">
                    <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed p-4 bg-background/50 rounded">
                      {documentPreview}
                    </pre>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Extracted text preview • Use the button above to open full document in new tab
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">Select a document to preview</p>
              <p className="text-xs text-muted-foreground">Click to view full document</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;