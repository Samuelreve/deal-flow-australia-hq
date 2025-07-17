
import { useState, useEffect, useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { useUnifiedDocumentUpload } from "@/hooks/useUnifiedDocumentUpload";
import { supabase } from "@/integrations/supabase/client";
import { unifiedDocumentUploadService } from "@/services/documents/unifiedDocumentUploadService";

/**
 * Hook for managing documents with unified upload service
 */
export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedVersionUrl, setSelectedVersionUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const { uploading, uploadDocument: uploadDoc, deleteDocument: deleteDoc } = useUnifiedDocumentUpload();

  // Load documents for deal
  const loadDocuments = useCallback(async () => {
    if (!dealId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          latest_version:document_versions!latest_version_id (*),
          uploader:profiles!uploaded_by (
            name,
            email
          )
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw document data:', data);

      const mappedDocuments: Document[] = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        type: doc.type,
        status: doc.status,
        uploadedBy: doc.uploaded_by,
        uploaderName: doc.uploader?.name,
        latestVersionId: doc.latest_version_id,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        latestVersion: doc.latest_version ? {
          id: doc.latest_version.id,
          documentId: doc.latest_version.document_id,
          versionNumber: doc.latest_version.version_number,
          url: '',
          uploadedBy: doc.latest_version.uploaded_by,
          uploadedAt: new Date(doc.latest_version.created_at),
          size: doc.latest_version.size,
          type: doc.latest_version.type,
          description: doc.latest_version.description
        } : undefined
      }));

      console.log('Mapped documents:', mappedDocuments);

      setDocuments(mappedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  // Load versions for a document
  const loadVersions = useCallback(async (documentId: string) => {
    setLoadingVersions(true);
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      const mappedVersions: DocumentVersion[] = data.map(version => ({
        id: version.id,
        documentId: version.document_id,
        versionNumber: version.version_number,
        url: '', // Will be populated when needed
        uploadedBy: version.uploaded_by,
        uploadedAt: new Date(version.created_at),
        size: version.size,
        type: version.type,
        description: version.description
      }));

      setDocumentVersions(mappedVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  // Upload document using unified service
  const uploadDocument = useCallback(async (file: File, category: string, documentId?: string) => {
    const result = await uploadDoc({
      file,
      dealId,
      category,
      documentId
    });

    if (result) {
      // Refresh documents list
      await loadDocuments();
      
      // If adding version to selected document, refresh versions
      if (documentId && selectedDocument?.id === documentId) {
        await loadVersions(documentId);
      }
    }

    return result;
  }, [uploadDoc, dealId, loadDocuments, selectedDocument, loadVersions]);

  // Delete document using unified service
  const deleteDocument = useCallback(async (document: Document) => {
    const success = await deleteDoc(document.id, dealId);
    if (success) {
      await loadDocuments();
      if (selectedDocument?.id === document.id) {
        setSelectedDocument(null);
        setDocumentVersions([]);
      }
    }
    return success;
  }, [deleteDoc, dealId, loadDocuments, selectedDocument]);

  // Select document and load its versions
  const selectDocument = useCallback(async (document: Document) => {
    setSelectedDocument(document);
    await loadVersions(document.id);
  }, [loadVersions]);

  // Select version and get signed URL
  const selectVersion = useCallback(async (version: DocumentVersion) => {
    setSelectedVersionId(version.id);
    
    // Get signed URL for the version
    const url = await unifiedDocumentUploadService.createSignedUrl(dealId, version.url);
    setSelectedVersionUrl(url);
  }, [dealId]);

  // Delete document version
  const deleteDocumentVersion = useCallback(async (version: DocumentVersion) => {
    try {
      const { error } = await supabase
        .from('document_versions')
        .delete()
        .eq('id', version.id);

      if (error) throw error;

      // Refresh versions
      if (selectedDocument) {
        await loadVersions(selectedDocument.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting version:', error);
      return false;
    }
  }, [selectedDocument, loadVersions]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    uploading,
    selectedDocument,
    documentVersions,
    loadingVersions,
    selectedVersionId,
    selectedVersionUrl,
    uploadDocument,
    deleteDocument,
    deleteDocumentVersion,
    selectDocument,
    selectVersion,
    refreshDocuments: loadDocuments,
    refreshVersions: loadVersions
  };
};
