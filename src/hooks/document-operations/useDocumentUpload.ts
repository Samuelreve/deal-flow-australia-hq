
import { useState } from "react";
import { Document } from "@/types/deal";
import { documentService } from "@/services/documentService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useDocumentUpload = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void
) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  /**
   * Upload a document to the deal
   */
  const uploadDocument = async (
    file: File, 
    category: string, 
    documentId?: string
  ): Promise<Document | null> => {
    setUploading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Authentication required");
      }
      
      // Upload document
      const document = await documentService.uploadDocument(
        file, 
        category, 
        dealId, 
        user.id,
        documentId
      );
      
      // Notify parent component of document change
      if (onDocumentsChange) {
        // Fetch updated documents list
        const updatedDocuments = await documentService.getDocuments(dealId);
        onDocumentsChange(updatedDocuments);
      }
      
      toast({
        title: documentId ? "Version added" : "Document uploaded",
        description: `${file.name} has been successfully uploaded.`
      });
      
      return document;
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Save a generated text as a document
   */
  const saveGeneratedTemplate = async (
    content: string,
    filename: string,
    category: string
  ): Promise<Document | null> => {
    // Convert content to a file
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], filename, { type: "text/plain" });
    
    // Use the standard document upload function
    return uploadDocument(file, category);
  };

  return {
    uploading,
    uploadDocument,
    saveGeneratedTemplate
  };
};
