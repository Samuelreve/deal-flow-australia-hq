
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RealContractUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

const RealContractUpload: React.FC<RealContractUploadProps> = ({
  onFileUpload,
  uploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await onFileUpload(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Please log in to upload and analyze contracts.
          </p>
          <Button disabled className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Login Required
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Contract
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Upload your contract document to analyze it with AI assistance.
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          disabled={uploading}
        />
        
        <Button 
          onClick={handleUploadClick}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose Contract File
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: PDF, Word documents, Text files
        </p>
      </CardContent>
    </Card>
  );
};

export default RealContractUpload;
