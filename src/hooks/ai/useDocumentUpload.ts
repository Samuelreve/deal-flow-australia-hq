import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UploadedDocument {
  name: string;
  content: string;
}

export const useDocumentUpload = () => {
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['.txt', '.pdf', '.docx', '.md', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a supported document (TXT, PDF, DOCX, MD, CSV, JSON)');
      return;
    }

    try {
      let content = '';
      
      if (file.type === 'text/plain' || fileExtension === '.txt' || fileExtension === '.md') {
        // For text files, read directly
        content = await file.text();
      } else {
        // For PDFs, DOCX, etc. - use the text-extractor edge function
        setIsExtracting(true);
        toast.loading('Extracting document text...', { id: 'extracting' });

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        // Call text-extractor edge function
        const { data, error } = await supabase.functions.invoke('text-extractor', {
          body: {
            fileBase64: base64,
            mimeType: file.type,
            fileName: file.name
          }
        });

        toast.dismiss('extracting');
        setIsExtracting(false);

        if (error || !data?.success) {
          console.error('Text extraction failed:', error || data?.error);
          toast.error(data?.error || 'Failed to extract document text');
          return;
        }

        content = data.text;
        console.log(`✅ Extracted ${content.length} characters from ${file.name}`);
      }

      setUploadedDocument({
        name: file.name,
        content: content
      });

      toast.success(`Document "${file.name}" uploaded and processed!`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process the document');
      setIsExtracting(false);
      toast.dismiss('extracting');
    }

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeDocument = () => {
    setUploadedDocument(null);
  };

  return {
    uploadedDocument,
    isExtracting,
    handleFileUpload,
    removeDocument
  };
};
