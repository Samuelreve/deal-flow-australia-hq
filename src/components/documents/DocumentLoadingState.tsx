
import React from 'react';
import { Loader2 } from 'lucide-react';

const DocumentLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/20 animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">Loading document...</p>
    </div>
  );
};

export default DocumentLoadingState;
