
import { useState } from 'react';
import { toast } from 'sonner';

interface UploadedDocument {
  name: string;
  content: string;
}

export const useDocumentUpload = () => {
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.txt', '.pdf', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a text, PDF, or Word document');
      return;
    }

    try {
      let content = '';
      
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        // For demo purposes, we'll show that the file was uploaded
        // In a real implementation, you'd use a proper PDF/Word parser
        content = `[Document uploaded: ${file.name}] - Full document parsing would be implemented here with proper PDF/Word extraction libraries.`;
      }

      setUploadedDocument({
        name: file.name,
        content: content
      });

      toast.success(`Document "${file.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read the document');
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
    handleFileUpload,
    removeDocument
  };
};
