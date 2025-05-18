
import React from 'react';

interface DocumentErrorStateProps {
  error: string;
}

const DocumentErrorState: React.FC<DocumentErrorStateProps> = ({ error }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <p className="text-destructive">Error loading document: {error}</p>
    </div>
  );
};

export default DocumentErrorState;
