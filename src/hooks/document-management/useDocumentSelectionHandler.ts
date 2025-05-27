
import { useCallback, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";

interface UseDocumentSelectionHandlerProps {
  documents: Document[];
  selectDocument: (document: Document) => void;
  selectVersion: (version: DocumentVersion) => void;
  analyzeModeActive: boolean;
  docIdToAnalyze: string | null;
}

/**
 * Hook for handling document and version selection
 */
export const useDocumentSelectionHandler = ({
  documents,
  selectDocument,
  selectVersion,
  analyzeModeActive,
  docIdToAnalyze
}: UseDocumentSelectionHandlerProps) => {
  
  // When in analyze mode, select the document to analyze
  useEffect(() => {
    if (analyzeModeActive && docIdToAnalyze) {
      const docToSelect = documents.find(doc => doc.id === docIdToAnalyze);
      if (docToSelect) {
        selectDocument(docToSelect);
      }
    }
  }, [analyzeModeActive, docIdToAnalyze, documents, selectDocument]);

  // Handle document selection
  const handleSelectDocument = useCallback(
    async (document: Document) => {
      selectDocument(document);
    },
    [selectDocument]
  );
  
  // Handle version selection
  const handleSelectVersion = useCallback(
    (version: DocumentVersion) => {
      selectVersion(version);
    },
    [selectVersion]
  );

  return {
    handleSelectDocument,
    handleSelectVersion
  };
};
