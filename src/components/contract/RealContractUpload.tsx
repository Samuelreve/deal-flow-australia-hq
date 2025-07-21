
import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UploadProgressIndicator from './upload/UploadProgressIndicator';
import ContractUploadHeader from './upload/ContractUploadHeader';
import FileTypeSupportShowcase from './upload/FileTypeSupportShowcase';
import AIAnalysisFeatures from './upload/AIAnalysisFeatures';
import FileUploadButton from './upload/FileUploadButton';
import FileRequirements from './upload/FileRequirements';
import AuthenticationRequired from './upload/AuthenticationRequired';

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
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  console.log('📤 RealContractUpload render:', {
    isUploading,
    uploading,
    isProcessing,
    uploadProgress,
    error,
    user: user?.id
  });

  const handleUploadClick = () => {
    console.log('🖱️ Upload button clicked');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed:', e.target.files?.length);
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      console.log('📄 Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      try {
        console.log('🚀 Calling onFileUpload...');
        await onFileUpload(e);
        console.log('✅ onFileUpload completed');
      } catch (error) {
        console.error('❌ Error in handleFileChange:', error);
      }
    } else {
      console.log('⚠️ No file selected');
    }
  };

  if (!user) {
    console.log('🚫 No user, showing auth required');
    return <AuthenticationRequired />;
  }

  return (
    <div className="space-y-4">
      {/* Upload Progress Indicator - Show prominently when uploading */}
      {(isProcessing || uploadProgress > 0 || error) && (
        <UploadProgressIndicator
          isUploading={isProcessing}
          uploadProgress={uploadProgress}
          fileName={selectedFileName}
          error={error}
        />
      )}

      <Card className={isProcessing ? 'opacity-75' : ''}>
        <ContractUploadHeader />
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Upload your contract document for AI-powered analysis. Now supports enhanced file types with advanced text extraction.
          </p>

          {error && !isProcessing && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadProgress === 100 && !isProcessing && !error && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Contract uploaded and processed successfully! Text extracted and ready for AI analysis.
              </AlertDescription>
            </Alert>
          )}

          <FileTypeSupportShowcase />
          <AIAnalysisFeatures />
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
            disabled={isProcessing}
          />
          
          <FileUploadButton 
            onClick={handleUploadClick}
            isProcessing={isProcessing}
          />
          
          <FileRequirements />
        </CardContent>
      </Card>
    </div>
  );
};

export default RealContractUpload;
