
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadProgressIndicatorProps {
  isUploading: boolean;
  uploadProgress: number;
  fileName?: string;
  stage?: string;
  error?: string | null;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  isUploading,
  uploadProgress,
  fileName,
  stage,
  error
}) => {
  if (!isUploading && uploadProgress < 100 && !error) {
    return null;
  }

  const getStageMessage = () => {
    if (error) return "Upload failed";
    if (uploadProgress < 20) return "Uploading file...";
    if (uploadProgress < 40) return "Processing document...";
    if (uploadProgress < 70) return "Extracting text content...";
    if (uploadProgress < 90) return "Analyzing with AI...";
    if (uploadProgress >= 100) return "Upload complete!";
    return stage || "Processing...";
  };

  const getStageIcon = () => {
    if (error) return <AlertCircle className="h-6 w-6 text-red-600" />;
    if (uploadProgress >= 100) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (uploadProgress >= 70) return <FileText className="h-6 w-6 text-blue-600" />;
    return <Upload className="h-6 w-6 text-blue-600" />;
  };

  const cardClassName = error ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50";
  const textColor = error ? "text-red-900" : "text-blue-900";

  return (
    <Card className={cardClassName}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {isUploading && uploadProgress < 100 && !error ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : (
              getStageIcon()
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${textColor}`}>
                {error ? 'Upload Failed' : uploadProgress >= 100 ? 'Upload Complete!' : 'Uploading Document'}
              </h4>
              <span className={`text-sm font-medium ${error ? 'text-red-700' : 'text-blue-700'}`}>
                {Math.round(uploadProgress)}%
              </span>
            </div>
            
            {fileName && (
              <p className={`text-sm truncate ${error ? 'text-red-700' : 'text-blue-700'}`}>
                {fileName}
              </p>
            )}
            
            <Progress 
              value={uploadProgress} 
              className={`h-2 ${error ? 'bg-red-100' : 'bg-blue-100'}`}
              indicatorClassName={error ? 'bg-red-600' : 'bg-blue-600'}
            />
            
            <p className={`text-xs ${error ? 'text-red-600' : 'text-blue-600'}`}>
              {error || getStageMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadProgressIndicator;
