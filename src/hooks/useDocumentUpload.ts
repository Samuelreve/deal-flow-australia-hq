
import { useState } from "react";
import { Document } from "@/types/deal";

interface UseDocumentUploadProps {
  onUpload: (file: File, category: string, documentId?: string) => Promise<void>;
  uploading: boolean;
  documents: Document[];
}

/**
 * Hook for managing document upload state and logic
 */
export const useDocumentUpload = ({ onUpload, uploading, documents }: UseDocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadType, setUploadType] = useState<'new' | 'version'>('new');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setUploadError(null);
  };

  const handleUploadTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUploadType(event.target.value as 'new' | 'version');
    setUploadError(null);
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDocumentId(event.target.value);
    setUploadError(null);
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
      // For new documents, pass category; for versions, pass existing document ID
      if (uploadType === 'new') {
        await onUpload(selectedFile, selectedCategory);
      } else {
        await onUpload(selectedFile, '', selectedDocumentId);
      }
      
      // Clear form after successful upload
      setSelectedFile(null);
      setSelectedCategory("");
      setSelectedDocumentId("");
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setUploadError(error.message || 'File upload failed');
    }
  };

  return {
    selectedFile,
    selectedCategory,
    uploadType,
    selectedDocumentId,
    uploadError,
    handleFileChange,
    handleCategoryChange,
    handleUploadTypeChange,
    handleDocumentChange,
    handleUploadClick,
    isUploadDisabled: 
      !selectedFile || 
      (uploadType === 'new' && !selectedCategory) || 
      (uploadType === 'version' && !selectedDocumentId) || 
      uploading
  };
};
