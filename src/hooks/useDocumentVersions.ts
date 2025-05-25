
import { useState, useCallback } from "react";
import { DocumentVersion } from "@/types/deal";
import { documentService } from "@/services/documentService";

export const useDocumentVersions = (dealId: string) => {
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const fetchDocumentVersions = useCallback(async (documentId: string) => {
    setLoadingVersions(true);
    try {
      const versions = await documentService.getDocumentVersions(documentId);
      setDocumentVersions(versions);
      return versions;
    } catch (error) {
      console.error("Error fetching document versions:", error);
      return [];
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  return {
    documentVersions,
    loadingVersions,
    fetchDocumentVersions
  };
};
