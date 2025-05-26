
import { useState } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import { toast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";

/**
 * Hook for managing document versions
 */
export const useDocumentVersions = (dealId: string) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Fetch versions for a specific document
  const fetchDocumentVersions = async (documentId: string) => {
    setLoadingVersions(true);
    try {
      const versions = await documentService.getDocumentVersions(dealId, documentId);
      setDocumentVersions(versions);
      return versions;
    } catch (error) {
      console.error("Error fetching document versions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch document versions.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoadingVersions(false);
    }
  };

  /**
   * Select a document to view its versions
   */
  const selectDocument = async (document: Document) => {
    setSelectedDocument(document);
    await fetchDocumentVersions(document.id);
  };

  return {
    selectedDocument,
    documentVersions,
    loadingVersions,
    selectDocument,
    fetchDocumentVersions,
    setDocumentVersions
  };
};
