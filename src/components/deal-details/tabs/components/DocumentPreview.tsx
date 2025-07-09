import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewProps {
  documentPreview: string;
  previewLoading: boolean;
  onOpenDocumentInNewTab: () => void;
  dealId: string;
  selectedDocument?: {
    id: string;
    name: string;
    type: string;
    storage_path?: string;
    latestVersionId?: string;
  } | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentPreview,
  previewLoading,
  onOpenDocumentInNewTab,
  dealId,
  selectedDocument,
}) => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [iframeError, setIframeError] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
    if (selectedDocument?.latestVersionId) {
      generateDocumentUrl();
    } else {
      setDocumentUrl('');
    }
  }, [selectedDocument?.latestVersionId]);

  const generateDocumentUrl = async () => {
    if (!selectedDocument?.latestVersionId) return;
    
    setIsLoadingUrl(true);
    setIframeError(false);
    
    try {
      // Get the document version details
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .select('storage_path')
        .eq('id', selectedDocument.latestVersionId)
        .single();

      if (versionError || !versionData?.storage_path) {
        console.error('Error getting storage path:', versionError);
        setIframeError(true);
        return;
      }

      // Create signed URL for the document
      // Construct full storage path with deal ID
      const fullStoragePath = versionData.storage_path.includes('/') 
        ? versionData.storage_path 
        : `${dealId}/${versionData.storage_path}`;
      
      const { data: urlData, error: urlError } = await supabase.storage
        .from('deal_documents')
        .createSignedUrl(fullStoragePath, 3600); // 1 hour expiry

      if (urlError || !urlData?.signedUrl) {
        console.error('Error creating signed URL:', urlError);
        setIframeError(true);
        return;
      }

      setDocumentUrl(urlData.signedUrl);
    } catch (error) {
      console.error('Error generating document URL:', error);
      setIframeError(true);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const getDocumentType = () => {
    if (!selectedDocument?.type) return 'unknown';
    return selectedDocument.type.toLowerCase();
  };

  const isPdfDocument = () => {
    const type = getDocumentType();
    return type === 'pdf' || type === 'application/pdf';
  };

  const getExternalViewerUrl = () => {
    if (!documentUrl) return '';
    
    const type = getDocumentType();
    const encodedUrl = encodeURIComponent(documentUrl);
    
    // For Office documents (docx, doc, pptx, xlsx, etc.)
    if (type.includes('word') || type.includes('docx') || type.includes('doc') || 
        type.includes('excel') || type.includes('xlsx') || type.includes('xls') ||
        type.includes('powerpoint') || type.includes('pptx') || type.includes('ppt')) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }
    
    // For Google Docs compatible formats
    if (type.includes('rtf') || type.includes('txt') || type.includes('odt')) {
      return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
    }
    
    // Fallback to Google Docs viewer
    return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
  };

  const shouldUseIframe = () => {
    return documentUrl && (isPdfDocument() || getDocumentType() !== 'unknown');
  };

  const getIframeUrl = () => {
    if (isPdfDocument()) {
      // Use Google Drive viewer for PDFs to avoid Chrome blocking issues
      const encodedUrl = encodeURIComponent(documentUrl);
      return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
    }
    return getExternalViewerUrl(); // External viewer for other formats
  };

  // Function to safely convert any value to readable text (fallback)
  const getDisplayText = (content: string): string => {
    if (!content) return '';
    
    if (typeof content === 'string') {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return content;
        }
      }
      return content;
    }
    
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content, null, 2);
    }
    
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
        {previewLoading || isLoadingUrl ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">
                {isLoadingUrl ? "Preparing document..." : "Loading preview..."}
              </p>
            </div>
          </div>
        ) : shouldUseIframe() && !iframeError ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Document Iframe */}
            <div className="flex-1 bg-background/30 rounded border min-h-0">
              <iframe
                src={getIframeUrl()}
                className="w-full h-full border-0 rounded"
                title="Document Preview"
                onError={() => setIframeError(true)}
                onLoad={() => setIframeError(false)}
                style={{ minHeight: '500px' }}
              />
            </div>
            
            {/* Footer - hidden on small devices */}
            <div className="hidden md:flex flex-shrink-0 px-2 border-t bg-muted/20 items-center" style={{ height: '18px' }}>
              <p className="text-xs text-muted-foreground text-center leading-none w-full" style={{ fontSize: '11px' }}>
                {isPdfDocument() ? 'PDF Preview' : 'Document Preview via External Viewer'} • Click the button above to open in new tab
              </p>
            </div>
          </div>
        ) : iframeError && documentUrl ? (
          <div className="flex-1 flex flex-col min-h-0">
            <Alert className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load document preview. The document may not be compatible with inline viewing.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary underline ml-1"
                  onClick={onOpenDocumentInNewTab}
                >
                  Click here to open in a new tab.
                </Button>
              </AlertDescription>
            </Alert>
            
            {/* Fallback to text preview if available */}
            {displayText && (
              <div className="flex-1 flex flex-col min-h-0 mx-4 mb-4">
                <h5 className="text-sm font-medium mb-2">Text Content (Extracted)</h5>
                <div 
                  className="overflow-y-scroll overflow-x-hidden p-4 bg-background/30 rounded border custom-scrollbar flex-1"
                  style={{
                    scrollbarWidth: 'auto',
                    scrollbarColor: 'rgb(156 163 175) rgb(229 231 235)'
                  }}
                >
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground break-words">
                    {displayText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : displayText ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Text Content */}
            <div 
              className="overflow-y-scroll overflow-x-hidden p-4 bg-background/30 rounded border custom-scrollbar"
              style={{
                height: 'calc(600px - 140px)',
                maxHeight: 'calc(600px - 140px)',
                scrollbarWidth: 'auto',
                scrollbarColor: 'rgb(156 163 175) rgb(229 231 235)'
              }}
            >
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground break-words">
                {displayText}
              </pre>
            </div>
            
            {/* Footer - hidden on small devices */}
            <div className="hidden md:flex flex-shrink-0 px-2 border-t bg-muted/20 items-center" style={{ height: '18px' }}>
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