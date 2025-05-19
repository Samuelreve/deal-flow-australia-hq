
import React from 'react';
import { Loader2 } from 'lucide-react';

const DocumentLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span className="text-muted-foreground">Loading document...</span>
    </div>
  );
};

export default DocumentLoadingState;
