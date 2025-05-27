
import { useState, useCallback, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { toast } from "sonner";

interface UseDocumentManagementProps {
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
  
  // Document state and operations
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
    selectedVersionId,
    selectedVersionUrl,
    selectVersion,
    refreshDocuments,
    refreshVersions
  } = useDocuments(dealId, initialDocuments);

  // UI state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showVersionDeleteDialog, setShowVersionDeleteDialog] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<DocumentVersion | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [versionToShare, setVersionToShare] = useState<DocumentVersion | null>(null);
  
  const [lastUploadedDocument, setLastUploadedDocument] = useState<{
    id: string;
    versionId: string;
    name: string;
  } | null>(null);

  // Handle document selection
  const handleSelectDocument = useCallback(async (document: Document) => {
    console.log("Selecting document:", document);
    try {
      await selectDocument(document);
    } catch (error) {
      console.error("Error selecting document:", error);
      toast.error("Failed to load document versions");
    }
  }, [selectDocument]);

  // Handle file upload
  const handleUpload = useCallback(async (
    file: File, 
    category: string, 
    documentId?: string
  ): Promise<Document | null> => {
    console.log("Starting upload:", { fileName: file.name, category, documentId });
    
    try {
      const result = await uploadDocument(file, category, documentId);
      
      if (result) {
        console.log("Upload successful:", result);
        
        // Set as last uploaded document to trigger inline analyzer
        setLastUploadedDocument({
          id: result.id,
          versionId: result.latestVersionId || '',
          name: result.name
        });
        
        // Refresh documents list
        await refreshDocuments();
        
        toast.success(
          documentId ? "Version added successfully" : "Document uploaded successfully",
          {
            description: `${file.name} has been processed.`
          }
        );
      }
      
      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return null;
    }
  }, [uploadDocument, refreshDocuments]);

  // Document deletion handlers
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
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  }, [documentToDelete, deleteDocument, closeDeleteDialog]);

  // Version deletion handlers
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
      closeVersionDeleteDialog();
    } catch (error) {
      console.error("Version delete failed:", error);
      toast.error("Failed to delete version");
    } finally {
      setIsDeletingVersion(false);
    }
  }, [versionToDelete, deleteDocumentVersion, closeVersionDeleteDialog]);

  // Version operations
  const handleSelectVersion = useCallback((version: DocumentVersion) => {
    selectVersion(version);
  }, [selectVersion]);

  const handleShareVersion = useCallback((version: DocumentVersion) => {
    setVersionToShare(version);
    setShowShareDialog(true);
  }, []);

  const closeShareDialog = useCallback(() => {
    setShowShareDialog(false);
    setVersionToShare(null);
  }, []);

  // Clear last uploaded document
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
    
    // User info
    user
  };
};
