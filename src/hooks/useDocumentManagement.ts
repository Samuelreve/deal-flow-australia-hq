
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useDocuments } from "@/hooks/useDocuments";

export interface UseDocumentManagementProps {
  dealId: string;
  initialDocuments?: Document[];
  isParticipant?: boolean;
}

export const useDocumentManagement = ({ 
  dealId, 
  initialDocuments = [],
  isParticipant = false
}: UseDocumentManagementProps) => {
  const { user } = useAuth();

  // Document deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Version deletion state
  const [showVersionDeleteDialog, setShowVersionDeleteDialog] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  
  // Version viewing state
  const [selectedVersionUrl, setSelectedVersionUrl] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [versionToShare, setVersionToShare] = useState<DocumentVersion | null>(null);
  
  // Last uploaded document state
  const [lastUploadedDocument, setLastUploadedDocument] = useState<{
    id: string;
    versionId: string;
    name: string;
  } | null>(null);

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
    refreshVersions
  } = useDocuments(dealId, initialDocuments);

  // Handle document deletion
  const openDeleteDialog = useCallback((document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  }, []);
  
  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
  }, []);
  
  const confirmDelete = useCallback(async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete);
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  }, [documentToDelete, deleteDocument, closeDeleteDialog]);

  // Handle version deletion
  const openVersionDeleteDialog = useCallback((version: DocumentVersion) => {
    setVersionToDelete(version);
    setShowVersionDeleteDialog(true);
  }, []);
  
  const closeVersionDeleteDialog = useCallback(() => {
    setShowVersionDeleteDialog(false);
    setVersionToDelete(null);
  }, []);
  
  const confirmVersionDelete = useCallback(async () => {
    if (!versionToDelete) return;
    
    setIsDeletingVersion(true);
    try {
      await deleteDocumentVersion(versionToDelete);
      closeVersionDeleteDialog();
    } finally {
      setIsDeletingVersion(false);
    }
  }, [versionToDelete, deleteDocumentVersion, closeVersionDeleteDialog]);

  // Handle document selection with Promise conversion to match expected type
  const handleSelectDocument = useCallback(async (document: Document) => {
    selectDocument(document);
    return Promise.resolve();
  }, [selectDocument]);

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

  // Handle selecting a version for viewing
  const handleSelectVersion = useCallback((version: DocumentVersion) => {
    if (version && version.url) {
      setSelectedVersionUrl(version.url);
      setSelectedVersionId(version.id);
    }
  }, []);
  
  // Handle sharing a document version
  const handleShareVersion = useCallback((version: DocumentVersion) => {
    setVersionToShare(version);
    setShowShareDialog(true);
  }, []);
  
  const closeShareDialog = useCallback(() => {
    setShowShareDialog(false);
    setVersionToShare(null);
  }, []);
  
  // Clear the last uploaded document info
  const clearLastUploadedDocument = useCallback(() => {
    setLastUploadedDocument(null);
  }, []);
  
  // Handle versions update
  const handleVersionsUpdated = useCallback(() => {
    refreshVersions(selectedDocument?.id);
  }, [refreshVersions, selectedDocument]);
  
  // Handle documents update
  const handleDocumentsUpdated = useCallback(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return {
    // Document list state and handlers
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    handleSelectDocument,
    handleUpload,
    
    // Document deletion
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    documentToDelete,
    showDeleteDialog,
    isDeleting,
    
    // Version operations
    handleSelectVersion,
    selectedVersionUrl,
    selectedVersionId,
    
    // Version deletion
    openVersionDeleteDialog,
    closeVersionDeleteDialog,
    confirmVersionDelete,
    versionToDelete,
    showVersionDeleteDialog,
    isDeletingVersion,
    
    // Sharing
    handleShareVersion,
    closeShareDialog,
    showShareDialog,
    versionToShare,
    
    // Inline analyzer
    lastUploadedDocument,
    clearLastUploadedDocument,
    
    // Updates
    handleVersionsUpdated,
    handleDocumentsUpdated,
    
    // User info
    user,
    isParticipant
  };
};
