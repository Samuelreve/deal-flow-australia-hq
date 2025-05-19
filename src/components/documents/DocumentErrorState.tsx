
import React from 'react';

interface DocumentErrorStateProps {
  error: string;
}

const DocumentErrorState: React.FC<DocumentErrorStateProps> = ({ error }) => {
  return (
    <div className="flex justify-center items-center h-full text-destructive">
      <p>Error loading document: {error}</p>
    </div>
  );
};

export default DocumentErrorState;
