
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

  console.log('🔧 useContractUpload initialized with user:', user?.id);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 useContractUpload.handleFileUpload started');
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    if (!user) {
      const errorMsg = 'Please ensure you are logged in';
      console.error('❌ No user logged in');
      toast.error(errorMsg);
      return;
    }

    console.log('📄 Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      userId: user.id
    });

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be under 10MB';
      console.error('❌ File too large:', file.size);
      toast.error(errorMsg);
      return;
    }

    // Validate file type
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/rtf',
      'text/rtf'
    ];

    if (!supportedTypes.includes(file.type)) {
      const errorMsg = `Unsupported file type: ${file.type}. Please upload a PDF, Word document (.docx/.doc), RTF, or text file.`;
      console.error('❌ File type validation failed:', errorMsg);
      setError(errorMsg);
      toast.error('Unsupported file type', {
        description: 'Please upload a PDF, Word document, RTF, or text file'
      });
      return;
    }

    console.log('✅ File type validation passed');

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      console.log('⏳ Starting upload progress simulation...');
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          const increment = file.type === 'text/plain' ? Math.random() * 20 : Math.random() * 10;
          return prev + increment;
        });
      }, 300);

      console.log('📤 Calling realContractService.uploadContract...');

      // Upload contract using the service
      const contract = await realContractService.uploadContract(file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('📥 Upload service returned:', contract ? 'Success' : 'Null');

      if (contract) {
        console.log('🏗️ Creating document metadata...');
        
        // Create document metadata from contract
        const contractMetadata: DocumentMetadata = {
          id: contract.id,
          name: contract.name || file.name,
          type: contract.mime_type || file.type,
          uploadDate: contract.created_at || new Date().toISOString(),
          status: (contract.extraction_status === 'completed' || contract.analysis_status === 'completed') ? 'completed' : 'error',
          version: '1.0',
          versionDate: contract.created_at || new Date().toISOString(),
          size: contract.file_size || file.size,
          category: 'contract'
        };

        // Update state with extracted text content
        const textContent = contract.text_content || contract.content || '';
        console.log('📝 Updating state with text content:', textContent.length, 'characters');
        
        console.log('🔄 Calling state setters...');
        setDocuments([contractMetadata]);
        setSelectedDocument(contractMetadata);
        setContractText(textContent);
        console.log('✅ State setters called');

        // Show success message
        const fileTypeLabel = getFileTypeLabel(file.type);
        if (contract.extraction_status === 'completed' || contract.analysis_status === 'completed') {
          toast.success(`${fileTypeLabel} uploaded successfully!`, {
            description: `Text extracted (${textContent.length} characters) and ready for AI analysis`
          });
        } else {
          toast.warning(`${fileTypeLabel} uploaded with limited functionality`, {
            description: 'Text extraction failed but file is saved. Some AI features may be limited.'
          });
        }
      } else {
        console.error('❌ Contract upload returned null');
        throw new Error('Contract upload failed - no data returned');
      }

      // Clear the input
      e.target.value = '';
      console.log('🧹 Input cleared');
      
    } catch (error) {
      console.error('❌ Error uploading contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast.error('Failed to upload contract', {
        description: 'Please try again with a valid document'
      });
    } finally {
      setUploading(false);
      console.log('🏁 Upload process completed');
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
    case 'application/rtf':
    case 'text/rtf':
      return 'RTF document';
    case 'text/plain':
      return 'Text file';
    default:
      return 'Document';
  }
}
