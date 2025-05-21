
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document, DocumentVersion } from "@/types/deal";
import { documentService } from "@/services/documentService";
import { useToast } from "@/components/ui/use-toast";

export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchDocuments = async () => {
    if (!dealId) return;
    setIsLoading(true);
    try {
      const fetchedDocuments = await documentService.getDocuments(dealId);
      setDocuments(fetchedDocuments);
      
      // If there are selected document, refresh its data
      if (selectedDocument) {
        const refreshedDocument = fetchedDocuments.find(doc => doc.id === selectedDocument.id);
        if (refreshedDocument) {
          setSelectedDocument(refreshedDocument);
        }
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDocumentVersions = async (documentId: string) => {
    if (!documentId) return;
    setLoadingVersions(true);
    try {
      const versions = await documentService.getDocumentVersions(documentId);
      setDocumentVersions(versions);
    } catch (error: any) {
      console.error("Error fetching document versions:", error);
      toast({
        title: "Error",
        description: "Failed to load document versions",
        variant: "destructive"
      });
    } finally {
      setLoadingVersions(false);
    }
  };
  
  // Load documents on initial render
  useEffect(() => {
    if (dealId) {
      fetchDocuments();
    }
  }, [dealId]);
  
  // Load document versions when a document is selected
  useEffect(() => {
    if (selectedDocument?.id) {
      fetchDocumentVersions(selectedDocument.id);
    } else {
      setDocumentVersions([]);
    }
  }, [selectedDocument]);
  
  const uploadDocument = async (
    file: File, 
    category: string, 
    documentId?: string
  ): Promise<Document | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload documents.",
        variant: "destructive"
      });
      return null;
    }
    
    setUploading(true);
    try {
      const uploadedDocument = await documentService.uploadDocument(
        file, 
        category, 
        dealId, 
        user.id,
        documentId
      );
      
      // Refresh document list after upload
      fetchDocuments();
      
      toast({
        title: documentId ? "Version Added" : "Document Uploaded",
        description: `${file.name} has been successfully uploaded.`
      });
      
      return uploadedDocument;
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const deleteDocument = async (document: Document): Promise<boolean> => {
    try {
      await documentService.deleteDocument(document.id);
      
      // Update local documents list
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== document.id));
      
      // Reset selected document if it was deleted
      if (selectedDocument?.id === document.id) {
        setSelectedDocument(null);
      }
      
      toast({
        title: "Document Deleted",
        description: `${document.name} has been deleted successfully.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const deleteDocumentVersion = async (version: DocumentVersion): Promise<boolean> => {
    try {
      await documentService.deleteDocumentVersion(version.id);
      
      // Update versions list
      setDocumentVersions(prevVersions => prevVersions.filter(v => v.id !== version.id));
      
      // Refresh document list to get updated version counts
      fetchDocuments();
      
      toast({
        title: "Version Deleted",
        description: `Version ${version.versionNumber} has been deleted successfully.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting document version:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete document version",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const selectDocument = (document: Document | null) => {
    setSelectedDocument(document);
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
    deleteDocumentVersion
  };
};
