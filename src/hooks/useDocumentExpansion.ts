
import { useState, useCallback } from "react";
import { Document } from "@/types/documentVersion";

export const useDocumentExpansion = (onSelectDocument: (document: Document) => Promise<void>) => {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const toggleDocumentExpand = useCallback(async (document: Document) => {
    if (expandedDocId === document.id) {
      setExpandedDocId(null);
    } else {
      setExpandedDocId(document.id);
      await onSelectDocument(document);
    }
  }, [expandedDocId, onSelectDocument]);

  return {
    expandedDocId,
    toggleDocumentExpand
  };
};
