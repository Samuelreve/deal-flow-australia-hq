
import { useState, useCallback, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "./documents/useDocuments";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

interface UseDocumentManagementProps {
  dealId: string;
  initialDocuments?: Document[];
  isParticipant?: boolean;
}

export const useDocumentManagement = ({
  dealId,
  initialDocuments = [],
  isParticipant = false,
}: UseDocumentManagementProps) => {
  const { user } = useAuth();
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [showVersionDeleteDialog, setShowVersionDeleteDialog] = useState(false);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  
  const [versionToShare, setVersionToShare] = useState<DocumentVersion | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
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
  
  // Initialize document hooks
  const {
    documents,
    isLoading,
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    selectedVersionId,
    selectedVersionUrl,
    selectVersion,
    uploading,
    uploadDocument,
    deleteDocument,
    deleteDocumentVersion,
    refreshDocuments,
    refreshVersions
  } = useDocuments(dealId, initialDocuments);

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

  // Handle document deletion dialog
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
      toast.success("Document deleted successfully");
      refreshDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      closeDeleteDialog();
    }
  }, [documentToDelete, deleteDocument, refreshDocuments, closeDeleteDialog]);

  // Handle version deletion dialog
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
      toast.success("Version deleted successfully");
      if (selectedDocument) {
        refreshVersions(selectedDocument.id);
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("Failed to delete version");
    } finally {
      setIsDeletingVersion(false);
      closeVersionDeleteDialog();
    }
  }, [versionToDelete, deleteDocumentVersion, refreshVersions, selectedDocument, closeVersionDeleteDialog]);

  // Handle version sharing dialog
  const handleShareVersion = useCallback((version: DocumentVersion) => {
    setVersionToShare(version);
    setShowShareDialog(true);
  }, []);

  const closeShareDialog = useCallback(() => {
    setShowShareDialog(false);
    setVersionToShare(null);
  }, []);

  // Handle document upload
  const handleUpload = useCallback(async (file: File, category: string, documentId?: string): Promise<Document | null> => {
    try {
      const uploadedDoc = await uploadDocument(file, category, documentId);
      
      if (uploadedDoc && uploadedDoc.latestVersion) {
        // Store the last uploaded document for analysis
        setLastUploadedDocument({
          id: uploadedDoc.id,
          versionId: uploadedDoc.latestVersion.id,
          name: uploadedDoc.name
        });
        
        // Select the uploaded document
        selectDocument(uploadedDoc);
        if (uploadedDoc.latestVersion) {
          selectVersion(uploadedDoc.latestVersion);
        }
      }
      
      return uploadedDoc;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
      return null;
    }
  }, [uploadDocument, selectDocument, selectVersion]);

  // Clear inline analyzer state
  const clearLastUploadedDocument = useCallback(() => {
    setLastUploadedDocument(null);
  }, []);

  // Handle versions updated
  const handleVersionsUpdated = useCallback(() => {
    if (selectedDocument) {
      refreshVersions(selectedDocument.id);
    }
  }, [selectedDocument, refreshVersions]);

  return {
    // Document list state
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
    
    // User info
    user
  };
};
