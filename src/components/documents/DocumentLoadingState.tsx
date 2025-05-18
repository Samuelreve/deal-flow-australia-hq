
import React from 'react';

const DocumentLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground animate-pulse">Loading document...</p>
    </div>
  );
};

export default DocumentLoadingState;
