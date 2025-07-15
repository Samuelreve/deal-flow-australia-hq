
import React, { useState, useMemo } from 'react';

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
  const getDocumentType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx'].includes(extension)) return 'excel';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    return 'other';
  };

  const getViewerUrl = useMemo(() => {
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

  return (
    <div className="h-full">
      <iframe 
        src={getViewerUrl}
        className="w-full h-full border-0" 
        title="Document Viewer"
        onLoad={onLoad}
        onError={onError}
        allow="fullscreen"
      />
    </div>
  );
};

export default DocumentIframe;
