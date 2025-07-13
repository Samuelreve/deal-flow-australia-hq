
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { unifiedDocumentUploadService } from '@/services/documents/unifiedDocumentUploadService';
import { UploadedDocument } from '@/components/deals/deal-creation/types';

export const useDocumentUploadWizard = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File, dealId: string, category: string = 'Other'): Promise<UploadedDocument | null> => {
    if (!file || !dealId || !user) {
      toast({
        title: "Upload Error",
        description: "Missing file, deal information, or user authentication",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    
    try {
      // Use unified service to upload document
      const document = await unifiedDocumentUploadService.uploadDocument({
        file,
        dealId,
        category,
        userId: user.id
      });

      if (!document) {
        throw new Error('Failed to upload document');
      }

      // Create signed URL for preview
      const signedUrl = await unifiedDocumentUploadService.createSignedUrl(dealId, document.latestVersion?.url || '');

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      // Return uploaded document object for wizard
      const uploadedDoc: UploadedDocument = {
        id: document.id,
        filename: file.name,
        type: file.type,
        category,
        size: file.size,
        uploadedAt: new Date(),
        url: signedUrl,
        storagePath: document.latestVersion?.url || ''
      };

      return uploadedDoc;
    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file to storage",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (storagePath: string, dealId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "User must be logged in to delete files",
        variant: "destructive"
      });
      return false;
    }

    try {
      // For wizard uploads, we need to delete by storage path
      // This is a simplified version for temporary uploads during deal creation
      const { error } = await supabase.storage
        .from('deal_documents')
        .remove([`${dealId}/${storagePath}`]);

      if (error && !error.message.includes('not found')) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('File deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete file from storage",
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
