
import React from 'react';

interface DocumentManagementHeaderProps {
  dealTitle?: string;
}

const DocumentManagementHeader: React.FC<DocumentManagementHeaderProps> = ({
  dealTitle
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        Documents {dealTitle ? `for ${dealTitle}` : ''}
      </h1>
    </div>
  );
};

export default DocumentManagementHeader;
