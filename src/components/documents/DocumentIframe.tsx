
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentIframeProps {
  documentVersionUrl: string;
  onLoad?: () => void;
  onError?: () => void;
}

const DocumentIframe: React.FC<DocumentIframeProps> = ({ 
  documentVersionUrl,
  onLoad,
  onError
}) => {
  const [useDirectView, setUseDirectView] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isSupabaseSignedUrl = (url: string): boolean => {
    return url.includes('supabase') && url.includes('token=');
  };

  const getDocumentType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx'].includes(extension)) return 'excel';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    return 'other';
  };

  const getViewerUrl = useMemo(() => {
    // If it's a Supabase signed URL, external viewers won't work due to CORS
    if (isSupabaseSignedUrl(documentVersionUrl)) {
      return documentVersionUrl; // Use direct URL for signed documents
    }

    const docType = getDocumentType(documentVersionUrl);
    const encodedUrl = encodeURIComponent(documentVersionUrl);
    
    switch (docType) {
      case 'pdf':
        // Use Google Docs viewer for PDFs
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      
      case 'word':
      case 'excel':
      case 'powerpoint':
        // Use Microsoft Office Online viewer for Office documents
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
      
      default:
        // Try Google Docs viewer as fallback
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
    }
  }, [documentVersionUrl]);

  const handleIframeError = () => {
    setHasError(true);
    if (onError) onError();
    
    // If external viewer fails and it's not already using direct view, try direct view
    if (!useDirectView && !isSupabaseSignedUrl(documentVersionUrl)) {
      setUseDirectView(true);
      setHasError(false);
    }
  };

  const handleIframeLoad = () => {
    setHasError(false);
    if (onLoad) onLoad();
  };

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
    setUseDirectView(false);
  }, [documentVersionUrl]);

  if (hasError && useDirectView) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to display document preview. The document format may not be compatible with inline viewing.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const finalUrl = useDirectView ? documentVersionUrl : getViewerUrl;

  return (
    <div className="h-full">
      <iframe 
        src={finalUrl}
        className="w-full h-full border-0" 
        title="Document Viewer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="fullscreen"
      />
    </div>
  );
};

export default DocumentIframe;
