
import { useState, useEffect } from "react";
import { Document, DocumentVersion } from "@/types/deal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { documentService } from "@/services/documentService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for managing documents state and operations
 */
export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Fetch documents when component mounts or dealId changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (initialDocuments.length > 0) {
        setDocuments(initialDocuments);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const fetchedDocuments = await documentService.getDocuments(dealId);
        setDocuments(fetchedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [dealId, initialDocuments]);

  // Fetch versions for a specific document
  const fetchDocumentVersions = async (documentId: string) => {
    setLoadingVersions(true);
    try {
      const versions = await documentService.getDocumentVersions(dealId, documentId);
      setDocumentVersions(versions);
      return versions;
    } catch (error) {
      console.error("Error fetching document versions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch document versions.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoadingVersions(false);
    }
  };

  /**
   * Select a document to view its versions
   */
  const selectDocument = async (document: Document) => {
    setSelectedDocument(document);
    await fetchDocumentVersions(document.id);
  };

  /**
   * Upload a document (new document or new version)
   */
  const uploadDocument = async (file: File, category: string, existingDocumentId?: string) => {
    if (!user) {
      throw new Error('You must be logged in to upload files.');
    }

    setUploading(true);

    try {
      const newDocument = await documentService.uploadDocument(
        file, 
        category, 
        dealId, 
        user.id,
        existingDocumentId
      );
      
      if (existingDocumentId) {
        // Update the existing document in the list
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => 
            doc.id === existingDocumentId ? newDocument : doc
          )
        );
        
        // Refresh versions if this document is selected
        if (selectedDocument && selectedDocument.id === existingDocumentId) {
          await fetchDocumentVersions(existingDocumentId);
        }
        
        toast({
          title: "New version uploaded",
          description: `Version ${newDocument.version} of ${file.name} has been uploaded.`,
        });
      } else {
        // Add the new document to the list
        setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
        
        toast({
          title: "File uploaded successfully!",
          description: `${file.name} has been uploaded.`,
        });
      }

      return newDocument;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your file.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete a document
   */
  const deleteDocument = async (document: Document) => {
    try {
      const success = await documentService.deleteDocument(document, dealId);
      
      if (success) {
        setDocuments(prevDocuments => 
          prevDocuments.filter(doc => doc.id !== document.id)
        );
        
        // Clear selected document if it was deleted
        if (selectedDocument && selectedDocument.id === document.id) {
          setSelectedDocument(null);
          setDocumentVersions([]);
        }
        
        toast({
          title: "Document deleted",
          description: `${document.name} has been deleted.`,
        });
      }
      
      return success;
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the file.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Delete a specific version of a document
   */
  const deleteDocumentVersion = async (version: DocumentVersion) => {
    try {
      // Extract storage path from URL
      const storagePath = version.url.split('?')[0].split('/').pop();
      if (!storagePath) {
        throw new Error("Could not determine file path from URL");
      }
      
      const success = await documentService.deleteDocumentVersion(
        version.id, 
        version.documentId, 
        dealId, 
        storagePath
      );
      
      if (success) {
        // Remove from versions list
        setDocumentVersions(prevVersions => 
          prevVersions.filter(v => v.id !== version.id)
        );
        
        // Refresh documents list to get updated latest_version_id
        const updatedDocuments = await documentService.getDocuments(dealId);
        setDocuments(updatedDocuments);
        
        toast({
          title: "Version deleted",
          description: `Version ${version.versionNumber} has been deleted.`,
        });
      }
      
      return success;
    } catch (error: any) {
      console.error("Delete version error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the version.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    documents,
    isLoading,
    uploading,
    uploadDocument,
    deleteDocument,
    selectedDocument,
    selectDocument,
    documentVersions,
    loadingVersions,
    fetchDocumentVersions,
    deleteDocumentVersion
  };
};
