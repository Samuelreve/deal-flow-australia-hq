
import { useState, useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "sonner";

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

  // Last uploaded document state
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

  // Version operations
  const handleSelectVersion = useCallback((version: DocumentVersion) => {
    selectVersion(version);
  }, [selectVersion]);

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
    handleVersionsUpdated
  };
};
