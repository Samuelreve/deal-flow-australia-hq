
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DocumentUploadState, DocumentMetadata } from '@/types/contract';

interface UseContractDocumentUploadProps {
  onUploadSuccess?: (metadata: DocumentMetadata, text: string, summary: any) => void;
  onUploadError?: (error: string) => void;
}

export const useContractDocumentUpload = ({
  onUploadSuccess,
  onUploadError
}: UseContractDocumentUploadProps = {}) => {
  const [uploadState, setUploadState] = useState<DocumentUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState({
      isUploading: true,
      uploadProgress: 0,
      error: null
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90)
        }));
      }, 200);

      // Simulate file processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);

      // Mock successful upload result
      const mockMetadata: DocumentMetadata = {
        name: file.name,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed' as const,
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size
      };

      const mockText = "Sample contract text from uploaded file...";
      const mockSummary = { summary: [{ title: "Contract Summary", content: "Analysis complete" }] };

      setUploadState({
        isUploading: false,
        uploadProgress: 100,
        error: null
      });

      onUploadSuccess?.(mockMetadata, mockText, mockSummary);
      
      toast.success("Document uploaded and analyzed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        error: errorMessage
      });

      onUploadError?.(errorMessage);
      toast.error(errorMessage);
    }
  }, [onUploadSuccess, onUploadError]);

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      error: null
    });
  }, []);

  return {
    ...uploadState,
    handleFileUpload,
    resetUploadState
  };
};
