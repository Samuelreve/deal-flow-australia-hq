
import React, { useState } from 'react';
import { useUnifiedDocumentUpload } from '@/hooks/useUnifiedDocumentUpload';
import { Document } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Upload, Loader } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface DocumentUploadFormProps {
  dealId: string;
  onUpload?: () => void;
  documents?: Document[];
}

const DocumentUploadForm = ({ 
  dealId,
  onUpload,
  documents = [] 
}: DocumentUploadFormProps) => {
  const { uploading, uploadProgress, uploadDocument } = useUnifiedDocumentUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadType, setUploadType] = useState<'new' | 'version'>('new');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const documentCategories = [
    "Contract",
    "Agreement", 
    "Financial Statement",
    "Legal Document",
    "Business Plan",
    "Due Diligence",
    "Other"
  ];

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
    
    if (uploadType === 'new' && !selectedCategory) {
      setUploadError('Please select a document category.');
      return;
    }
    
    if (uploadType === 'version' && !selectedDocumentId) {
      setUploadError('Please select a document to add a version to.');
      return;
    }
    
    try {
      const result = await uploadDocument({
        file: selectedFile,
        dealId,
        category: selectedCategory,
        documentId: uploadType === 'version' ? selectedDocumentId : undefined
      });
      
      if (result) {
        // Clear form after successful upload
        setSelectedFile(null);
        setSelectedCategory("");
        setSelectedDocumentId("");
        setUploadError(null);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Notify parent component
        onUpload?.();
      }
    } catch (error: any) {
      setUploadError(error.message || 'File upload failed');
    }
  };

  const isUploadDisabled = 
    !selectedFile || 
    (uploadType === 'new' && !selectedCategory) || 
    (uploadType === 'version' && !selectedDocumentId) || 
    uploading;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <select 
            className="w-full border rounded p-2 text-sm"
            onChange={(e) => setUploadType(e.target.value as 'new' | 'version')}
            value={uploadType}
          >
            <option value="new">Upload New Document</option>
            <option value="version" disabled={documents.length === 0}>
              Add Version to Existing Document
            </option>
          </select>
        </div>
        
        {uploadType === 'version' && (
          <div>
            <select 
              className="w-full border rounded p-2 text-sm"
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              value={selectedDocumentId}
              disabled={documents.length === 0}
            >
              <option value="">Select Document</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {uploadType === 'new' && (
          <div>
            <select 
              className="w-full border rounded p-2 text-sm"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="">Select Category</option>
              {documentCategories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input 
            type="file" 
            id="document-file" 
            className="w-full text-sm" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          
          <Button
            onClick={handleUploadClick}
            disabled={isUploadDisabled}
            size="sm"
          >
            {uploading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {uploadError && (
          <Alert variant="destructive">
            <p className="text-xs">{uploadError}</p>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadForm;
