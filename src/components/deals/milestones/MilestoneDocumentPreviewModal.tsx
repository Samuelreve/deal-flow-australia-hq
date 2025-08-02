import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface MilestoneDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    storage_path: string;
  } | null;
  dealId: string;
}

const MilestoneDocumentPreviewModal: React.FC<MilestoneDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  dealId,
}) => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [iframeError, setIframeError] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (isOpen && document) {
      generateDocumentUrl();
      fetchDocumentPreview();
    } else {
      setDocumentUrl('');
      setDocumentPreview('');
      setIframeError(false);
    }
  }, [isOpen, document]);

  const generateDocumentUrl = async () => {
    if (!document) return;
    
    setIsLoadingUrl(true);
    setIframeError(false);
    
    try {
      // Try different path formats for the deal_documents bucket
      const pathsToTry = [
        document.storage_path,
        `${dealId}/${document.storage_path}`,
        document.storage_path.split('/').pop(), // Just the filename
      ];
      
      let urlData: { signedUrl: string } | null = null;
      
      for (const path of pathsToTry) {
        try {
          const result = await supabase.storage
            .from('deal_documents')
            .createSignedUrl(path, 3600);
          
          if (result.data?.signedUrl && !result.error) {
            urlData = result.data;
            break;
          }
        } catch (error) {
          console.log(`Failed to get signed URL for path: ${path}`, error);
          continue;
        }
      }

      if (urlData?.signedUrl) {
        setDocumentUrl(urlData.signedUrl);
      } else {
        setIframeError(true);
      }
    } catch (error) {
      console.error('Error generating document URL:', error);
      setIframeError(true);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const fetchDocumentPreview = async () => {
    if (!document) return;
    
    setPreviewLoading(true);
    
    try {
      // Try to get text content if available
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', document.id)
        .single();

      if (error) {
        setDocumentPreview('Unable to load document preview.');
        return;
      }

      // For now, we'll just show basic document info since text_content 
      // field doesn't exist in the documents table
      setDocumentPreview(`Document: ${document.name}\n\nThis document has been uploaded for this milestone.\nUse the external link to view the full document.`);
    } catch (error) {
      console.error('Error fetching document preview:', error);
      setDocumentPreview('Error loading document preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const getDocumentType = () => {
    if (!document) return '';
    const extension = document.name.split('.').pop()?.toLowerCase();
    return extension || '';
  };

  const isPdfDocument = () => {
    return getDocumentType() === 'pdf';
  };

  const getExternalViewerUrl = () => {
    if (!documentUrl) return '';
    
    const docType = getDocumentType();
    
    if (isPdfDocument()) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`;
    }
    
    // For Office documents
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(docType)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`;
    }
    
    return documentUrl;
  };

  const shouldUseIframe = () => {
    const docType = getDocumentType();
    return ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(docType);
  };

  const getIframeUrl = () => {
    if (isPdfDocument()) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`;
    }
    return getExternalViewerUrl();
  };

  const getDisplayText = (content: string): string => {
    if (!content) return '';
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2);
      }
      return parsed.toString();
    } catch {
      // Not JSON, return as-is
      return content;
    }
  };

  const handleOpenInNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{document.name}</DialogTitle>
            {documentUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex min-h-0 gap-4">
          {/* Document Preview */}
          <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-background/50 flex-shrink-0">
              <h4 className="font-medium text-sm">Document Preview</h4>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {previewLoading || isLoadingUrl ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    {isLoadingUrl ? "Preparing document..." : "Loading preview..."}
                  </p>
                </div>
              ) : shouldUseIframe() && documentUrl && !iframeError ? (
                <div className="h-full flex flex-col">
                  <iframe
                    src={getIframeUrl()}
                    className="w-full h-full border-0 rounded"
                    title="Document Preview"
                    onError={() => setIframeError(true)}
                  />
                  <div className="px-2 py-1 bg-muted/50 border-t">
                    <p className="text-xs text-muted-foreground text-center leading-none w-full" style={{ fontSize: '11px' }}>
                      {isPdfDocument() ? 'PDF Preview' : 'Document Preview via External Viewer'}
                    </p>
                  </div>
                </div>
              ) : iframeError ? (
                <div className="p-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Unable to load document preview. The document may not be compatible with inline viewing.
                    </AlertDescription>
                  </Alert>
                  {documentUrl && (
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Document Externally
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex-1 p-4 overflow-auto">
                  <div className="custom-scrollbar">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground bg-muted/30 p-4 rounded-md">
                      {getDisplayText(documentPreview)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneDocumentPreviewModal;
