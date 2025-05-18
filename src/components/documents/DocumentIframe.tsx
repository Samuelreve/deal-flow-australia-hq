
import React from 'react';

interface DocumentIframeProps {
  documentVersionUrl: string;
  onLoad: () => void;
  onError: () => void;
}

const DocumentIframe: React.FC<DocumentIframeProps> = ({
  documentVersionUrl,
  onLoad,
  onError,
}) => {
  return (
    <div className="h-full">
      <iframe 
        src={documentVersionUrl}
        className="w-full h-full border-0" 
        title="Document Viewer"
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
};

export default DocumentIframe;
