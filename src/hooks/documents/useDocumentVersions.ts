
import { useState, useCallback, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useToast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";

/**
 * Hook for managing document versions
 */
export const useDocumentVersions = (dealId: string) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [selectedVersionUrl, setSelectedVersionUrl] = useState<string>('');
  
  const { toast } = useToast();

  const fetchDocumentVersions = useCallback(async (documentId?: string) => {
    if (!documentId) return;
    setLoadingVersions(true);
    try {
      const versions = await documentService.getDocumentVersions(documentId);
      setDocumentVersions(versions);
      
      // If there are versions and no selected version, select the first one
      if (versions.length > 0 && !selectedVersionId) {
        setSelectedVersionId(versions[0].id);
        setSelectedVersionUrl(versions[0].url);
      }
      
      return versions;
    } catch (error: any) {
      console.error("Error fetching document versions:", error);
      toast({
        title: "Error",
        description: "Failed to load document versions",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingVersions(false);
    }
  }, [selectedVersionId, toast]);

  // Load document versions when a document is selected
  useEffect(() => {
    if (selectedDocument?.id) {
      fetchDocumentVersions(selectedDocument.id);
    } else {
      setDocumentVersions([]);
    }
  }, [selectedDocument, fetchDocumentVersions]);

  const selectDocument = useCallback((document: Document | null) => {
    setSelectedDocument(document);
    // Reset selected version when changing document
    setSelectedVersionId('');
    setSelectedVersionUrl('');
  }, []);
  
  const selectVersion = useCallback((version: DocumentVersion) => {
    if (version && version.url) {
      setSelectedVersionId(version.id);
      setSelectedVersionUrl(version.url);
    }
  }, []);

  return {
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    fetchDocumentVersions,
    setDocumentVersions,
    selectedVersionId,
    selectedVersionUrl,
    selectVersion
  };
};
