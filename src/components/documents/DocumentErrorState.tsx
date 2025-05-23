
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DocumentErrorStateProps {
  error: string;
}

const DocumentErrorState: React.FC<DocumentErrorStateProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <Alert variant="destructive" className="w-full max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Document</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
};

export default DocumentErrorState;
