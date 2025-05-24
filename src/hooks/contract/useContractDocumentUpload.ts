
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
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Starting file upload for:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please upload a PDF, Word document, or text file';
      console.error('Invalid file type:', file.type);
      setError(errorMsg);
      props?.onUploadError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 10MB';
      console.error('File too large:', file.size);
      setError(errorMsg);
      props?.onUploadError?.(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to upload contracts');
      }

      console.log('User authenticated:', user.id);
      setUploadProgress(25);
      
      // Create a unique file path for contracts bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `contracts/${user.id}/${fileName}`;

      console.log('Uploading to path:', filePath);
      setUploadProgress(40);

      // Upload file to Supabase storage using the contracts bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData.path);
      setUploadProgress(60);

      // Extract text content using edge function
      let extractedText = '';
      try {
        console.log('Calling text extraction...');
        const { data: extractData, error: extractError } = await supabase.functions.invoke('text-extraction', {
          body: { 
            filePath: uploadData.path,
            fileName: file.name,
            mimeType: file.type
          }
        });

        if (extractError) {
          console.warn('Text extraction failed:', extractError);
        } else {
          extractedText = extractData?.text || '';
          console.log('Text extracted, length:', extractedText.length);
        }
      } catch (extractError) {
        console.warn('Text extraction request failed:', extractError);
      }
      
      setUploadProgress(80);

      // Save contract to database
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          content: extractedText,
          analysis_status: 'completed'
        })
        .select()
        .single();

      if (contractError) {
        console.error('Database save error:', contractError);
        throw new Error(`Failed to save contract: ${contractError.message}`);
      }

      // Create document metadata
      const metadata: DocumentMetadata = {
        id: contractData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        version: '1.0',
        versionDate: new Date().toISOString()
      };

      console.log('Created metadata:', metadata);

      // Generate AI summary if we have text content
      let summary = null;
      if (extractedText && extractedText.length > 100) {
        try {
          console.log('Generating AI summary...');
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('document-ai-assistant', {
            body: {
              operation: 'summarize_contract',
              content: extractedText,
              documentId: contractData.id,
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
            console.log('AI summary generated successfully');

            // Save summary to database
            await supabase
              .from('contract_summaries')
              .insert({
                contract_id: contractData.id,
                summary_data: summary
              });
          } else {
            console.warn('AI summary generation failed:', summaryError);
          }
        } catch (summaryError) {
          console.warn('AI summary request failed:', summaryError);
        }
      }

      setUploadProgress(100);
      
      // Call success callback
      console.log('Calling success callback...');
      props?.onUploadSuccess?.(metadata, extractedText, summary);
      
      toast.success('Contract uploaded and analyzed successfully!');
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error: any) {
      console.error('Upload error details:', error);
      const errorMsg = error.message || 'Failed to upload and process contract';
      setError(errorMsg);
      props?.onUploadError?.(errorMsg);
      toast.error(errorMsg);
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Clear the file input so the same file can be uploaded again
    event.target.value = '';
  }, [props]);

  return {
    handleFileUpload,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null)
  };
};
