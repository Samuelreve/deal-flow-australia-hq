
import { useCallback } from "react";
import { Document, DocumentVersion } from "@/types/documentVersion";
import { toast } from "sonner";

interface UseDocumentUploadHandlerProps {
  uploadDocument: (file: File, category: string, documentId?: string) => Promise<Document | null>;
  selectDocument: (document: Document) => void;
  selectVersion: (version: DocumentVersion) => void;
  setLastUploadedDocument: (doc: { id: string; versionId: string; name: string; } | null) => void;
}

/**
 * Hook for handling document uploads
 */
export const useDocumentUploadHandler = ({
  uploadDocument,
  selectDocument,
  selectVersion,
  setLastUploadedDocument
}: UseDocumentUploadHandlerProps) => {

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
  }, [uploadDocument, selectDocument, selectVersion, setLastUploadedDocument]);

  return {
    handleUpload
  };
};
