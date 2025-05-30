
import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Document } from "@/types/documentVersion";

export const useDocumentListActions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnalyzeDocument = useCallback((document: Document, versionId: string | undefined) => {
    if (!versionId) return;
    
    // Add analyze parameters to URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("analyze", "true");
    searchParams.set("docId", document.id);
    searchParams.set("versionId", versionId);
    
    // Navigate to the same page with updated params
    navigate(`${location.pathname}?${searchParams.toString()}`);
  }, [navigate, location]);

  return {
    handleAnalyzeDocument
  };
};
