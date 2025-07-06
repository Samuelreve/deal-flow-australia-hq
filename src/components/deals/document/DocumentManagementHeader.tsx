
import React from 'react';
import DocumentCleanupButton from './DocumentCleanupButton';

interface DocumentManagementHeaderProps {
  dealTitle?: string;
  dealId?: string;
  onDocumentsUpdated?: () => void;
}

const DocumentManagementHeader: React.FC<DocumentManagementHeaderProps> = ({
  dealTitle,
  dealId,
  onDocumentsUpdated
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Documents {dealTitle ? `for ${dealTitle}` : ''}
        </h1>
        
        {dealId && (
          <DocumentCleanupButton 
            dealId={dealId}
            onCleanupComplete={onDocumentsUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentManagementHeader;
