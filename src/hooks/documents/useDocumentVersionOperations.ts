
import { useState, useCallback } from "react";
import { DocumentVersion } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { documentService } from "@/services/documentService";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for managing document version operations
 */
export const useDocumentVersionOperations = (
  dealId: string, 
  documentId: string,
  refreshDocuments: () => void,
  refreshVersions: (documentId?: string) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const deleteDocumentVersion = useCallback(async (version: DocumentVersion): Promise<boolean> => {
    try {
      // Fix: Pass all required parameters
      await documentService.deleteDocumentVersion(
        version,
        dealId,
        user?.id || '',
        documentId || version.documentId,
        version.documentId
      );
      
      // Refresh versions and documents
      refreshVersions(documentId || version.documentId);
      refreshDocuments();
      
      toast({
        title: "Version Deleted",
        description: `Version ${version.versionNumber} has been deleted successfully.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting document version:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete document version",
        variant: "destructive"
      });
      return false;
    }
  }, [dealId, user?.id, documentId, refreshVersions, refreshDocuments, toast]);

  return {
    deleteDocumentVersion
  };
};
