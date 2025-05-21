
import React from 'react';
import { DocumentVersion } from '@/types/deal';
import DocumentViewer from './DocumentViewer';

interface AIDrivenDocumentViewerProps {
  documentVersion: DocumentVersion;
  dealId: string;
}

const AIDrivenDocumentViewer: React.FC<AIDrivenDocumentViewerProps> = ({ 
  documentVersion,
  dealId 
}) => {
  if (!documentVersion || !documentVersion.url) {
    return (
      <div className="p-4 border rounded-lg bg-muted text-center">
        <p className="text-muted-foreground">No document available to display</p>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <DocumentViewer 
        documentUrl={documentVersion.url}
        dealId={dealId}
        documentId={documentVersion.documentId}
        versionId={documentVersion.id}
      />
    </div>
  );
};

export default AIDrivenDocumentViewer;
