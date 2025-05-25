
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

  const validateFile = (file: File): string | null => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, Word documents, and text files are supported';
    }

    return null;
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        error: validationError
      });
      onUploadError?.(validationError);
      toast.error(validationError);
      return;
    }

    setUploadState({
      isUploading: true,
      uploadProgress: 0,
      error: null
    });

    try {
      // Simulate upload progress with more realistic stages
      const stages = [
        { progress: 20, message: 'Uploading file...' },
        { progress: 40, message: 'Processing document...' },
        { progress: 60, message: 'Extracting text...' },
        { progress: 80, message: 'Analyzing content...' },
        { progress: 95, message: 'Finalizing...' }
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setUploadState(prev => ({
          ...prev,
          uploadProgress: stage.progress
        }));
        toast.loading(stage.message, { id: 'upload-progress' });
      }

      // Mock successful upload result with more realistic data
      const mockMetadata: DocumentMetadata = {
        name: file.name,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed' as const,
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size,
        category: 'contract'
      };

      // Generate mock text based on file type
      let mockText = "Sample contract text from uploaded file...";
      if (file.type === 'application/pdf') {
        mockText = "PDF contract content extracted and processed...";
      } else if (file.type.includes('word')) {
        mockText = "Word document contract content extracted and processed...";
      }

      const mockSummary = { 
        summary: [
          { 
            title: "Contract Analysis Complete", 
            content: `Successfully analyzed ${file.name}. The document has been processed and is ready for review.`
          }
        ] 
      };

      setUploadState({
        isUploading: false,
        uploadProgress: 100,
        error: null
      });

      // Dismiss loading toast and show success
      toast.dismiss('upload-progress');
      onUploadSuccess?.(mockMetadata, mockText, mockSummary);
      
      toast.success("Document uploaded and analyzed successfully", {
        description: `${file.name} is now ready for analysis`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        error: errorMessage
      });

      toast.dismiss('upload-progress');
      onUploadError?.(errorMessage);
      toast.error("Upload failed", {
        description: errorMessage
      });
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
    resetUploadState,
    validateFile
  };
};
