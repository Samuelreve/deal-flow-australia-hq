
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, File, FileImage } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import UploadProgressIndicator from './upload/UploadProgressIndicator';

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
  const [selectedFileName, setSelectedFileName] = React.useState<string>('');

  const handleUploadClick = () => {
    console.log('Upload button clicked');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files?.length);
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
    await onFileUpload(e);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Contract for AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to upload and analyze contracts with AI assistance.
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
    <div className="space-y-4">
      {/* Upload Progress Indicator - Show prominently when uploading */}
      {(isProcessing || uploadProgress > 0) && (
        <UploadProgressIndicator
          isUploading={isProcessing}
          uploadProgress={uploadProgress}
          fileName={selectedFileName}
        />
      )}

      <Card className={isProcessing ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enhanced Contract Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Upload your contract document for AI-powered analysis. Now supports enhanced file types with advanced text extraction.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadProgress === 100 && !isProcessing && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Contract uploaded and processed successfully! Text extracted and ready for AI analysis.
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced file type support showcase */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Enhanced File Type Support
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-red-600" />
                <span><strong>PDF Documents</strong> - Advanced OCR extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-blue-600" />
                <span><strong>Word Files</strong> - .docx and .doc support</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-green-600" />
                <span><strong>Text Files</strong> - Instant processing</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-purple-600" />
                <span><strong>RTF Documents</strong> - Rich text format</span>
              </div>
            </div>
          </div>

          {/* AI Analysis Features */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-3">🤖 AI Analysis Capabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Instant contract summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Complex legal term explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Risk and obligation identification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Interactive Q&A assistant</span>
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
          
          <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 p-3 rounded">
            <p><strong>File Requirements:</strong></p>
            <p>• Maximum file size: 25MB</p>
            <p>• Supported formats: PDF, Word (.docx/.doc), RTF, Text (.txt)</p>
            <p>• Advanced text extraction for all file types</p>
            <p>• Secure storage with user-specific access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealContractUpload;
