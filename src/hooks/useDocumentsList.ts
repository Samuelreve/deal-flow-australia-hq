
import { useState, useEffect } from "react";
import { Document } from "@/types/deal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";

/**
 * Hook for managing the list of documents for a deal
 */
export const useDocumentsList = (dealId: string, initialDocuments: Document[] = []) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canUpload: false,
    canDelete: false,
    canAddVersions: false,
    userRole: null as string | null
  });

  // Fetch documents and permissions when component mounts or dealId changes
  useEffect(() => {
    const fetchDocumentsAndPermissions = async () => {
      if (initialDocuments.length > 0) {
        setDocuments(initialDocuments);
        setIsLoading(false);
      } else {
        await fetchDocuments();
      }
      
      if (user) {
        await fetchPermissions();
      }
    };
    
    fetchDocumentsAndPermissions();
  }, [dealId, initialDocuments, user?.id]);

  // Fetch documents from the server
  const fetchDocuments = async () => {
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

  // Fetch user permissions for document operations
  const fetchPermissions = async () => {
    if (!user) return;
    
    try {
      const accessControl = await documentService.getDocumentAccessControl(dealId, user.id);
      setPermissions({
        canUpload: accessControl.canUpload,
        canDelete: accessControl.canDelete,
        canAddVersions: accessControl.canAddVersions,
        userRole: accessControl.userRole
      });
    } catch (error) {
      console.error("Error fetching document permissions:", error);
    }
  };

  return {
    documents,
    isLoading,
    permissions,
    refreshDocuments: fetchDocuments,
    setDocuments
  };
};
