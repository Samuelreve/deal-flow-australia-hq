
import { Document, DocumentVersion } from "@/types/deal";
import { useDocumentsList } from "./useDocumentsList";
import { useDocumentVersions } from "./useDocumentVersions";
import { useDocumentOperations } from "./useDocumentOperations";

/**
 * Main hook for document management that combines the functionality 
 * of the more focused hooks
 */
export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  const {
    documents,
    isLoading,
    permissions,
    refreshDocuments,
    setDocuments
  } = useDocumentsList(dealId, initialDocuments);
  
  const {
    selectedDocument,
    documentVersions,
    loadingVersions,
    selectDocument,
    fetchDocumentVersions,
    setDocumentVersions
  } = useDocumentVersions(dealId);
  
  const {
    uploading,
    uploadDocument,
    deleteDocument,
    deleteDocumentVersion
  } = useDocumentOperations(
    dealId,
    setDocuments,
    setDocumentVersions
  );
  
  return {
    // From useDocumentsList
    documents,
    isLoading,
    permissions,
    
    // From useDocumentVersions
    selectedDocument,
    documentVersions,
    loadingVersions,
    selectDocument,
    fetchDocumentVersions,
    
    // From useDocumentOperations
    uploading,
    uploadDocument,
    deleteDocument,
    deleteDocumentVersion
  };
};
