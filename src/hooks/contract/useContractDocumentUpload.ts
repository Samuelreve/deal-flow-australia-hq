
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentMetadata } from '@/types/contract';

interface UseContractDocumentUploadProps {
  onUploadSuccess: (metadata: DocumentMetadata, text: string, summary?: any) => void;
  onUploadError: (error: string) => void;
}

export const useContractDocumentUpload = ({ 
  onUploadSuccess, 
  onUploadError 
}: UseContractDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      const error = 'Unsupported file type. Please upload PDF, Word, or text files.';
      onUploadError(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Extract text from file based on type
      let extractedText = '';
      
      if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        // For demo purposes, simulate PDF text extraction
        extractedText = `[PDF Content Extracted from ${file.name}]\n\nThis is a sample contract document. In a real implementation, this would contain the actual extracted text from the PDF file. The document contains various legal clauses, terms and conditions, and contractual obligations that would be analyzed by the AI system.`;
      } else if (file.type.includes('word')) {
        // For demo purposes, simulate Word document text extraction
        extractedText = `[Word Document Content Extracted from ${file.name}]\n\nThis is a sample contract document extracted from a Word file. In a real implementation, this would contain the actual extracted text from the Word document. The document includes legal language, contract terms, and various clauses that require AI analysis.`;
      }

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create document metadata
      const metadata: DocumentMetadata = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size,
        category: 'contract'
      };

      // Generate a simple summary
      const summary = {
        title: 'Document Summary',
        keyPoints: [
          'Document successfully uploaded and processed',
          `File size: ${(file.size / 1024).toFixed(1)} KB`,
          `Document type: ${file.type}`,
          'Text extraction completed'
        ],
        analysisDate: new Date().toISOString(),
        confidence: 0.95
      };

      // Call success callback
      onUploadSuccess(metadata, extractedText, summary);
      
      toast.success('Document uploaded successfully', {
        description: 'Text extracted and ready for AI analysis'
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload document';
      onUploadError(errorMessage);
      toast.error('Upload failed', {
        description: errorMessage
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    handleFileUpload
  };
};
