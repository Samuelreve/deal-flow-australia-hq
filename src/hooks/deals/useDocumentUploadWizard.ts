
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UploadedDocument } from '@/components/deals/deal-creation/types';

export const useDocumentUploadWizard = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, dealId: string): Promise<UploadedDocument | null> => {
    if (!file || !dealId) {
      toast({
        title: "Upload Error",
        description: "Missing file or deal information",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${dealId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create signed URL for preview
      const { data: signedUrlData } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      // Return uploaded document object
      const uploadedDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        filename: file.name,
        type: file.type,
        category: 'Other', // Default category
        size: file.size,
        uploadedAt: new Date(),
        url: signedUrlData?.signedUrl,
        storagePath: filePath
      };

      return uploadedDoc;
    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (storagePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('deal-documents')
        .remove([storagePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('File deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploading,
    uploadFile,
    deleteFile
  };
};
