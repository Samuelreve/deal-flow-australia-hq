
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DocumentMetadata } from '@/types/contract';

interface UseContractDocumentUploadProps {
  onUploadSuccess?: (metadata: DocumentMetadata, text: string, summary: any) => void;
  onUploadError?: (error: string) => void;
}

export const useContractDocumentUpload = (props?: UseContractDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please upload a PDF, Word document, or text file';
      setError(errorMsg);
      props?.onUploadError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 10MB';
      setError(errorMsg);
      props?.onUploadError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload contracts');
      }

      setUploadProgress(25);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `contracts/${user.id}/${fileName}`;

      setUploadProgress(50);

      // Upload file to Supabase storage (we'll create this bucket if needed)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(75);

      // Extract text content using edge function
      const { data: extractData, error: extractError } = await supabase.functions.invoke('text-extraction', {
        body: { 
          filePath: uploadData.path,
          fileName: file.name,
          mimeType: file.type
        }
      });

      if (extractError) {
        console.warn('Text extraction failed, proceeding without content:', extractError);
      }

      const extractedText = extractData?.text || '';
      
      setUploadProgress(90);

      // Create document metadata
      const metadata: DocumentMetadata = {
        id: `contract-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        version: '1.0',
        versionDate: new Date().toISOString()
      };

      // Generate AI summary if we have text content
      let summary = null;
      if (extractedText && extractedText.length > 100) {
        try {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('document-ai-assistant', {
            body: {
              operation: 'summarize_contract',
              content: extractedText,
              documentId: metadata.id,
              userId: user.id
            }
          });

          if (!summaryError && summaryData) {
            summary = {
              executiveSummary: summaryData.summary || 'AI summary generated successfully',
              keyTerms: summaryData.keyTerms || [],
              parties: summaryData.parties || [],
              importantDates: summaryData.importantDates || [],
              riskFactors: summaryData.riskFactors || []
            };
          }
        } catch (summaryError) {
          console.warn('AI summary generation failed:', summaryError);
        }
      }

      setUploadProgress(100);
      
      // Call success callback
      props?.onUploadSuccess?.(metadata, extractedText, summary);
      
      toast.success('Contract uploaded and analyzed successfully!');
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error.message || 'Failed to upload and process contract';
      setError(errorMsg);
      props?.onUploadError?.(errorMsg);
      toast.error(errorMsg);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [props]);

  return {
    handleFileUpload,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null)
  };
};
