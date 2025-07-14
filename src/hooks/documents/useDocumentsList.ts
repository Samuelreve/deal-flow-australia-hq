
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Document } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";

/**
 * Hook for managing the document list
 */
export const useDocumentsList = (dealId: string, initialDocuments: Document[] = []) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const fetchDocuments = useCallback(async () => {
    if (!dealId) return;
    setIsLoading(true);
    try {
      const fetchedDocuments = await documentService.getDocuments(dealId);
      setDocuments(fetchedDocuments);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [dealId, toast]);
  
  // Load documents on initial render
  useEffect(() => {
    if (dealId) {
      fetchDocuments();
    }
  }, [dealId, fetchDocuments]);

  // Refresh documents when signed=true is in URL (after document signing)
  useEffect(() => {
    if (searchParams.get('signed') === 'true' && dealId) {
      // Add a small delay to ensure the signed document is fully processed
      setTimeout(() => {
        fetchDocuments();
      }, 1000);
    }
  }, [searchParams, dealId, fetchDocuments]);

  return {
    documents,
    isLoading,
    fetchDocuments,
    setDocuments
  };
};
