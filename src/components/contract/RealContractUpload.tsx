
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, File } from 'lucide-react';
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
    console.log('Upload button clicked');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files?.length);
    await onFileUpload(e);
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
          Upload your contract document to analyze it with AI assistance. Supports PDF, Word, RTF, and text files.
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
              Contract uploaded and processed successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced file type indicators */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Supported File Types:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <File className="h-3 w-3 text-red-600" />
              <span>PDF Documents</span>
            </div>
            <div className="flex items-center gap-1">
              <File className="h-3 w-3 text-blue-600" />
              <span>Word (.docx, .doc)</span>
            </div>
            <div className="flex items-center gap-1">
              <File className="h-3 w-3 text-green-600" />
              <span>Text Files (.txt)</span>
            </div>
            <div className="flex items-center gap-1">
              <File className="h-3 w-3 text-purple-600" />
              <span>RTF Documents</span>
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.rtf"
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
          <p>Maximum file size: 25MB</p>
          <p>Advanced text extraction for PDF and Word documents</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealContractUpload;
