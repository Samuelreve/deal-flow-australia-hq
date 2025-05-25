
import { useState } from 'react';
import { documentService } from '@/services/documentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useDocumentUploadService = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadDocument = async (file: File, dealId: string, category: string) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    setIsUploading(true);
    try {
      const document = await documentService.uploadDocument(
        file,
        category,
        dealId,
        user.id
      );
      
      toast.success('Document uploaded successfully');
      return document;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error.message || 'Failed to upload document'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading
  };
};
