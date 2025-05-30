
import { useState } from "react";
import { Document } from "@/types/documentVersion";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadDocumentOptions {
  file: File;
  dealId: string;
  documentType: string;
  onProgress?: (progress: number) => void;
}

/**
 * Hook for document upload functionality 
 */
export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  /**
   * Upload a document to Supabase storage and database
   */
  const uploadDocument = async (options: UploadDocumentOptions): Promise<Document | null> => {
    const { file, dealId, documentType, onProgress } = options;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload documents",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${dealId}/${fileName}`;

      // Simulate progress updates
      if (onProgress) {
        onProgress(10);
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      if (onProgress) {
        onProgress(50);
      }

      // Create document record in database
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: file.name,
          type: file.type,
          size: file.size,
          category: documentType,
          uploaded_by: user.id,
          storage_path: filePath,
          status: 'draft'
        })
        .select()
        .single();

      if (docError) {
        console.error('Database insert error:', docError);
        // Clean up uploaded file
        await supabase.storage
          .from('deal-documents')
          .remove([filePath]);
        throw docError;
      }

      if (onProgress) {
        onProgress(80);
      }

      // Create initial document version
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: 1,
          size: file.size,
          type: file.type,
          storage_path: filePath,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (versionError) {
        console.error('Version creation error:', versionError);
        throw versionError;
      }

      // Update document with latest version
      await supabase
        .from('documents')
        .update({ latest_version_id: version.id })
        .eq('id', document.id);

      if (onProgress) {
        onProgress(100);
      }

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
      });

      return {
        id: document.id,
        name: document.name,
        category: document.category || documentType,
        type: document.type,
        uploadedBy: document.uploaded_by,
        latestVersionId: version.id,
        createdAt: new Date(document.created_at),
        updatedAt: new Date(document.updated_at)
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  return {
    uploading,
    uploadDocument
  };
};
