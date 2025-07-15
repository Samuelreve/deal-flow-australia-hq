
import { useState, useCallback, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";

/**
 * Core functionality for document management
 */
export const useDocumentManagementCore = ({
  dealId,
  initialDocuments = [],
}: {
  dealId: string;
  initialDocuments: Document[];
}) => {
  const { user } = useAuth();
  
  // Use the documents hook for core functionality
  const {
    documents,
    isLoading,
    uploading,
    uploadDocument,
    deleteDocument,
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    deleteDocumentVersion,
    refreshDocuments,
    refreshVersions,
    selectedVersionId,
    selectedVersionUrl,
    selectVersion
  } = useDocuments(dealId, initialDocuments);

  // Last uploaded document state
  const [lastUploadedDocument, setLastUploadedDocument] = useState<{
    id: string;
    versionId: string;
    name: string;
  } | null>(null);

  // Handle document upload with category and optional documentId
  const handleUpload = useCallback(async (file: File, category: string, documentId?: string) => {
    const uploadedDoc = await uploadDocument(file, category, documentId);
    
    // If upload was successful, set the last uploaded document info for inline analysis
    if (uploadedDoc) {
      setLastUploadedDocument({
        id: uploadedDoc.id,
        versionId: uploadedDoc.latestVersionId || '',
        name: uploadedDoc.name || file.name
      });
    }
    
    return uploadedDoc;
  }, [uploadDocument]);

  // Clear the last uploaded document info
  const clearLastUploadedDocument = useCallback(() => {
    setLastUploadedDocument(null);
  }, []);

  // Handle document selection with Promise conversion to match expected type
  const handleSelectDocument = useCallback(async (document: Document) => {
    selectDocument(document);
    return Promise.resolve();
  }, [selectDocument]);
  
  // Handle selecting a version for viewing
  const handleSelectVersion = useCallback((version: DocumentVersion) => {
    if (version && version.url) {
      selectVersion(version);
    }
  }, [selectVersion]);
  
  // Handle versions update
  const handleVersionsUpdated = useCallback(() => {
    refreshVersions(selectedDocument?.id);
  }, [refreshVersions, selectedDocument]);
  
  // Handle documents update
  const handleDocumentsUpdated = useCallback(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // Listen for external document updates (e.g., from signed document downloads)
  useEffect(() => {
    const handleExternalUpdate = () => {
      handleDocumentsUpdated();
    };

    window.addEventListener('documentsUpdated', handleExternalUpdate);
    return () => {
      window.removeEventListener('documentsUpdated', handleExternalUpdate);
    };
  }, [handleDocumentsUpdated]);

  return {
    // Document list state
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    
    // User information
    user,
    
    // Upload handling
    handleUpload,
    
    // Selection handling
    handleSelectDocument,
    handleSelectVersion,
    selectedVersionUrl,
    selectedVersionId,
    
    // Document operations
    deleteDocument,
    deleteDocumentVersion,
    
    // Analyzer support
    lastUploadedDocument,
    clearLastUploadedDocument,
    
    // Refresh handlers
    handleVersionsUpdated,
    handleDocumentsUpdated
  };
};
