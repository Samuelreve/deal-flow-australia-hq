
import { useState, useEffect } from "react";
import { Document } from "@/types/deal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";

/**
 * Hook for managing documents state and operations
 */
export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch documents when component mounts or dealId changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (initialDocuments.length > 0) {
        setDocuments(initialDocuments);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const fetchedDocuments = await documentService.getDocuments(dealId);
        setDocuments(fetchedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [dealId, initialDocuments]);

  /**
   * Upload a document
   */
  const uploadDocument = async (file: File, category: string) => {
    if (!user) {
      throw new Error('You must be logged in to upload files.');
    }

    setUploading(true);

    try {
      const newDocument = await documentService.uploadDocument(file, category, dealId, user.id);
      setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
      
      toast({
        title: "File uploaded successfully!",
        description: `${file.name} has been uploaded.`,
      });

      return newDocument;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your file.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete a document
   */
  const deleteDocument = async (document: Document) => {
    try {
      const success = await documentService.deleteDocument(document, dealId);
      
      if (success) {
        setDocuments(prevDocuments => 
          prevDocuments.filter(doc => doc.id !== document.id)
        );
        
        toast({
          title: "Document deleted",
          description: `${document.name} has been deleted.`,
        });
      }
      
      return success;
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the file.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    documents,
    isLoading,
    uploading,
    uploadDocument,
    deleteDocument
  };
};
