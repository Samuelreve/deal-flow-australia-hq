
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';

interface DocumentUploadAreaProps {
  uploading: boolean;
  uploadErrors: string[];
  onFileUpload: (files: FileList | null) => void;
}

export const DocumentUploadArea: React.FC<DocumentUploadAreaProps> = ({
  uploading,
  uploadErrors,
  onFileUpload
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.docx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      onFileUpload(target.files);
    };
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Drag and drop files here, or click to browse
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, Word documents, and images up to 10MB each
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={handleFileSelect}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>

        {uploadErrors.length > 0 && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {uploadErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
