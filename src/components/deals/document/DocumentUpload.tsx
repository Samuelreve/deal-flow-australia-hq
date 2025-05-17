
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

const DocumentUpload = ({ onUpload, uploading }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setUploadError(error.message || 'File upload failed');
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-lg font-semibold mb-3">Upload New Document</h4>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-3"
      />

      {selectedFile && (
        <p className="text-sm text-muted-foreground mb-3">
          Selected file: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}

      {uploadError && (
        <p className="text-sm text-red-600 mb-3">{uploadError}</p>
      )}

      <Button
        onClick={handleUploadClick}
        disabled={!selectedFile || uploading}
        className="mt-2"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </div>
  );
};

export default DocumentUpload;
