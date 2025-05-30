
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DocumentMetadata } from '@/types/contract';
import { realContractService } from '@/services/realContractService';

export const useContractUpload = (
  setDocuments: (docs: DocumentMetadata[]) => void,
  setSelectedDocument: (doc: DocumentMetadata | null) => void,
  setContractText: (text: string) => void
) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }

    // Validate file type with enhanced support
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain',
      'application/rtf',
      'text/rtf'
    ];

    if (!supportedTypes.includes(file.type)) {
      const errorMsg = `Unsupported file type: ${file.type}. Please upload a PDF, Word document (.docx/.doc), RTF, or text file.`;
      setError(errorMsg);
      toast.error('Unsupported file type', {
        description: 'Please upload a PDF, Word document, RTF, or text file'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Enhanced progress simulation for different file types
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          // Slower progress for PDF/Word files to account for text extraction
          const increment = file.type === 'text/plain' ? Math.random() * 20 : Math.random() * 10;
          return prev + increment;
        });
      }, 300);

      console.log(`Starting upload for ${file.type} file: ${file.name}`);

      // Upload contract using the enhanced service
      const contract = await realContractService.uploadContract(file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (contract) {
        // Create document metadata from contract
        const contractMetadata: DocumentMetadata = {
          id: contract.id,
          name: contract.name,
          type: contract.mime_type,
          uploadDate: contract.created_at,
          status: contract.extraction_status === 'completed' ? 'completed' : 'error',
          version: '1.0',
          versionDate: contract.created_at,
          size: contract.file_size,
          category: 'contract'
        };

        // Update state with extracted text content
        const textContent = contract.text_content || contract.content || '';
        
        setDocuments([contractMetadata]);
        setSelectedDocument(contractMetadata);
        setContractText(textContent);

        // Show file type specific success message
        const fileTypeLabel = getFileTypeLabel(file.type);
        if (contract.extraction_status === 'completed') {
          toast.success(`${fileTypeLabel} uploaded successfully!`, {
            description: `Text extracted (${textContent.length} characters) and ready for AI analysis`
          });
        } else {
          toast.warning(`${fileTypeLabel} uploaded with limited functionality`, {
            description: 'Text extraction failed but file is saved. Some AI features may be limited.'
          });
        }
      }

      // Clear the input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error uploading contract:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      toast.error('Failed to upload contract', {
        description: 'Please try again with a valid document'
      });
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  }, [user, setDocuments, setSelectedDocument, setContractText]);

  return {
    uploading,
    uploadProgress,
    error,
    handleFileUpload
  };
};

// Helper function to get user-friendly file type labels
function getFileTypeLabel(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF document';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Word document (.docx)';
    case 'application/msword':
      return 'Word document (.doc)';
    case 'application/rtf':
    case 'text/rtf':
      return 'RTF document';
    case 'text/plain':
      return 'Text file';
    default:
      return 'Document';
  }
}
