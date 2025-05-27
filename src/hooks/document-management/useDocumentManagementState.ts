
import { useState, useCallback, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useSearchParams } from "react-router-dom";

/**
 * Hook for managing document management state
 */
export const useDocumentManagementState = () => {
  // Document state for inline analyzer
  const [lastUploadedDocument, setLastUploadedDocument] = useState<{
    id: string;
    versionId: string;
    name: string;
  } | null>(null);
  
  // Get URL search params to determine if we're in analyze mode
  const [searchParams] = useSearchParams();
  const analyzeModeActive = searchParams.get("analyze") === "true";
  const docIdToAnalyze = searchParams.get("docId");

  // Clear inline analyzer state
  const clearLastUploadedDocument = useCallback(() => {
    setLastUploadedDocument(null);
  }, []);

  return {
    lastUploadedDocument,
    setLastUploadedDocument,
    clearLastUploadedDocument,
    analyzeModeActive,
    docIdToAnalyze
  };
};
