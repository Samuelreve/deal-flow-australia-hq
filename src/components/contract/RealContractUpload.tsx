
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface RealContractUploadProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  uploading?: boolean;
}

const RealContractUpload: React.FC<RealContractUploadProps> = ({
  onFileUpload,
  isUploading,
  uploadProgress = 0,
  error,
  uploading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  // Use either isUploading or uploading prop for backward compatibility
  const isProcessing = isUploading || uploading;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getProgressMessage = () => {
    if (uploadProgress < 25) return "Uploading file...";
    if (uploadProgress < 50) return "Processing document...";
    if (uploadProgress < 75) return "Extracting text...";
    if (uploadProgress < 95) return "Analyzing content...";
    return "Finalizing...";
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
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to upload and analyze contracts.
            </AlertDescription>
          </Alert>
          <Button disabled className="w-full mt-4">
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
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Upload your contract document to analyze it with AI assistance.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{getProgressMessage()}</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {uploadProgress === 100 && !isProcessing && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Contract uploaded and analyzed successfully!
            </AlertDescription>
          </Alert>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={onFileUpload}
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          disabled={isProcessing}
        />
        
        <Button 
          onClick={handleUploadClick}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose Contract File
            </>
          )}
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported formats: PDF, Word documents, Text files</p>
          <p>Maximum file size: 10MB</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealContractUpload;
