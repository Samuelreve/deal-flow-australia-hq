
import { useState, useCallback } from "react";
import { Document } from "@/types/deal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { unifiedDocumentUploadService } from "@/services/documents/unifiedDocumentUploadService";

interface UploadOptions {
  file: File;
  dealId: string;
  category: string;
  documentId?: string; // For adding versions
  documentName?: string; // Override name
  milestoneId?: string; // Associate with milestone
}

/**
 * Unified document upload hook that handles all upload scenarios
 */
export const useUnifiedDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadDocument = useCallback(async (options: UploadOptions): Promise<Document | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload documents",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await unifiedDocumentUploadService.uploadDocument({
        ...options,
        userId: user.id,
        onProgress: setUploadProgress
      });

      if (result) {
        toast({
          title: options.documentId ? "Version added" : "Document uploaded",
          description: options.documentId 
            ? `New version added to ${result.name}`
            : `${result.name} uploaded successfully`,
        });
      }

      return result;
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
      setUploadProgress(0);
    }
  }, [user, toast]);

  const deleteDocument = useCallback(async (documentId: string, dealId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete documents",
        variant: "destructive"
      });
      return false;
    }

    try {
      await unifiedDocumentUploadService.deleteDocument(documentId, dealId);
      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted",
      });
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const createSignedUrl = useCallback(async (dealId: string, filePath: string): Promise<string | null> => {
    return await unifiedDocumentUploadService.createSignedUrl(dealId, filePath);
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    createSignedUrl
  };
};
