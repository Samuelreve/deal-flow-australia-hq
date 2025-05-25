
import { useCallback, useState } from "react";
import { Document } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { documentService } from "@/services/documentService";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for handling document operations like upload and delete
 */
export const useDocumentOperations = (
  dealId: string, 
  refreshDocuments: () => void
) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadDocument = useCallback(async (
    file: File, 
    category: string, 
    documentId?: string
  ): Promise<Document | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload documents.",
        variant: "destructive"
      });
      return null;
    }
    
    setUploading(true);
    try {
      // When calling documentService.uploadDocument, pass all required parameters
      const uploadedDocument = await documentService.uploadDocument(
        file, 
        category, 
        dealId, 
        user.id,
        documentId
      );
      
      // Refresh document list after upload
      refreshDocuments();
      
      toast({
        title: documentId ? "Version Added" : "Document Uploaded",
        description: `${file.name} has been successfully uploaded.`
      });
      
      return uploadedDocument;
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [dealId, user, refreshDocuments, toast]);

  const deleteDocument = useCallback(async (document: Document): Promise<boolean> => {
    try {
      await documentService.deleteDocument(document.id);
      
      // Refresh document list
      refreshDocuments();
      
      toast({
        title: "Document Deleted",
        description: `${document.name} has been deleted successfully.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
      return false;
    }
  }, [refreshDocuments, toast]);

  return {
    uploading,
    uploadDocument,
    deleteDocument
  };
};
