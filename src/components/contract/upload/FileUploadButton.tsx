
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader } from 'lucide-react';

interface FileUploadButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onClick, isProcessing }) => {
  return (
    <Button 
      onClick={onClick}
      disabled={isProcessing}
      className="w-full"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Processing Document...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          Choose Contract File
        </>
      )}
    </Button>
  );
};

export default FileUploadButton;
