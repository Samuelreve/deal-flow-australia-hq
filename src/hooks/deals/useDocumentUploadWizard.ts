
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UploadedDocument } from '@/components/deals/deal-creation/types';

export const useDocumentUploadWizard = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = async (file: File, dealId: string): Promise<UploadedDocument | null> => {
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
      // Generate unique file path for the deal-documents bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${dealId}/${fileName}`;

      console.log('Uploading file to:', filePath);

      // Try to upload to Supabase Storage deal-documents bucket
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // If bucket doesn't exist, show helpful error message
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: "Storage Not Ready",
            description: "Document storage is not yet configured. Please contact support.",
            variant: "destructive"
          });
          return null;
        }
        
        throw uploadError;
      }

      // Create signed URL for preview (optional, may fail if bucket policies aren't set)
      const { data: signedUrlData } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      console.log('File uploaded successfully, signed URL:', signedUrlData?.signedUrl);

      // Return uploaded document object
      const uploadedDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        filename: file.name,
        type: file.type,
        category: 'Other', // Default category - user can change later
        size: file.size,
        uploadedAt: new Date(),
        url: signedUrlData?.signedUrl,
        storagePath: filePath
      };

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`,
      });

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

  const deleteFile = async (storagePath: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "User must be logged in to delete files",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Deleting file from storage:', storagePath);
      
      const { error } = await supabase.storage
        .from('deal-documents')
        .remove([storagePath]);

      if (error) {
        console.error('Delete error:', error);
        // Don't throw error if file doesn't exist, just log it
        if (!error.message.includes('not found')) {
          throw error;
        }
      }

      console.log('File deleted successfully from storage');
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
