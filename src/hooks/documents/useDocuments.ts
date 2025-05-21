
import { useDocumentsList } from "./useDocumentsList";
import { useDocumentOperations } from "./useDocumentOperations";
import { useDocumentVersions } from "./useDocumentVersions";
import { useDocumentVersionOperations } from "./useDocumentVersionOperations";
import { Document, DocumentVersion } from "@/types/documentVersion";

/**
 * Main hook for document management that composes other specialized hooks
 */
export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  // Get document list state and fetching capabilities
  const {
    documents,
    isLoading,
    fetchDocuments: refreshDocuments,
    setDocuments
  } = useDocumentsList(dealId, initialDocuments);
  
  // Get document versions state and operations
  const {
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    fetchDocumentVersions,
    selectedVersionId,
    selectedVersionUrl,
    selectVersion
  } = useDocumentVersions(dealId);

  // Get document operations (upload, delete)
  const {
    uploading,
    uploadDocument,
    deleteDocument
  } = useDocumentOperations(dealId, refreshDocuments);
  
  // Get version operations (delete)
  const { deleteDocumentVersion } = useDocumentVersionOperations(
    dealId, 
    selectedDocument?.id || '', 
    refreshDocuments, 
    fetchDocumentVersions
  );

  // Function to manually refresh versions for a specific document
  const refreshVersions = (documentId?: string) => {
    if (documentId) {
      fetchDocumentVersions(documentId);
    }
  };

  return {
    // Document list state
    documents,
    isLoading,
    
    // Document operations
    uploading,
    uploadDocument,
    deleteDocument,
    
    // Document selection
    selectedDocument,
    selectDocument,
    
    // Version state and operations
    documentVersions,
    loadingVersions,
    deleteDocumentVersion,
    
    // Version selection
    selectedVersionId,
    selectedVersionUrl,
    selectVersion: selectVersion as (version: DocumentVersion) => void,
    
    // Refresh functions
    refreshDocuments,
    refreshVersions
  };
};

// Re-export from the new location for backward compatibility
export * from "./useDocumentsList";
export * from "./useDocumentOperations";
export * from "./useDocumentVersions";
export * from "./useDocumentVersionOperations";
