
import { Document, DocumentVersion } from "@/types/deal";
import { useDocumentUpload } from "./useDocumentUpload";
import { useDocumentDelete } from "./useDocumentDelete";
import { useDocumentOperationsBase } from "./useDocumentOperationsBase";

/**
 * Main hook for document operations like upload, delete, etc.
 */
export const useDocumentOperations = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void,
  onVersionsChange?: (versions: DocumentVersion[]) => void
) => {
  // Get base properties
  const { uploading } = useDocumentOperationsBase(dealId, onDocumentsChange);
  
  // Get upload operations
  const { 
    uploadDocument, 
    saveGeneratedTemplate 
  } = useDocumentUpload(dealId, onDocumentsChange);
  
  // Get delete operations
  const { 
    deleteDocument, 
    deleteDocumentVersion 
  } = useDocumentDelete(dealId, onDocumentsChange, onVersionsChange);

  return {
    uploading,
    uploadDocument,
    saveGeneratedTemplate,
    deleteDocument,
    deleteDocumentVersion
  };
};
