
import { useState } from 'react';
import { Document, DocumentVersion } from '@/types/deal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadResult {
  document: Document;
  version: DocumentVersion & { url?: string };
}

export function useDocumentUploadService() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Upload a document to Supabase via Edge Function
   * 
   * @param file The file to upload
   * @param dealId The deal ID
   * @param category The document category
   * @param documentId Optional: existing document ID if adding a new version
   * @param documentName Optional: name for a new document (defaults to file name)
   */
  const uploadDocument = async (
    file: File, 
    dealId: string, 
    category: string,
    documentId?: string,
    documentName?: string
  ): Promise<UploadResult | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload documents",
        variant: "destructive"
      });
      return null;
    }

    if (!file || !dealId || !category) {
      toast({
        title: "Missing information",
        description: "File, deal ID, and category are required",
        variant: "destructive"
      });
      return null;
    }

    // If adding a version to existing document but no document ID provided
    if (!documentId && !documentName) {
      documentName = file.name; // Default to file name
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      if (documentId) {
        formData.append('documentId', documentId);
      }
      
      if (documentName) {
        formData.append('documentName', documentName);
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      // Call the edge function
      const functionPath = `document-upload`;
      
      // Add dealId to the formData instead of using the query parameter
      formData.append('dealId', dealId);
      
      const { data: result, error } = await supabase.functions.invoke(functionPath, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (error) {
        console.error("Upload error:", error);
        // Handle specific error for deal not found
        if (error.message?.includes('not found') || error.status === 404) {
          throw new Error(`Deal with ID ${dealId} not found or you don't have access to it`);
        }
        throw new Error(error.message || "Upload failed");
      }
      
      toast({
        title: documentId ? "Version added" : "Document uploaded",
        description: documentId 
          ? `New version added to ${result.document.name}`
          : `${result.document.name} uploaded successfully`,
      });

      return result;
    } catch (error: any) {
      console.error("Document upload error:", error);
      setUploadError(error.message || "Failed to upload document");
      
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your document",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadDocument,
    uploading,
    uploadError
  };
}
