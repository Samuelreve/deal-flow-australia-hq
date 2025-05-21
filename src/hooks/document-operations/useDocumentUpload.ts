
import { useState } from "react";
import { Document } from "@/types/documentVersion";
import { documentService } from "@/services/documentService";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentOperationsBase } from "./useDocumentOperationsBase";

export const useDocumentUpload = (
  dealId: string,
  onDocumentsChange?: (documents: Document[]) => void
) => {
  const { 
    user, 
    uploading, 
    setUploading, 
    onDocumentsChange: notifyDocumentsChange,
    showSuccessToast,
    showErrorToast
  } = useDocumentOperationsBase(dealId, onDocumentsChange);

  /**
   * Upload a document to the deal
   */
  const uploadDocument = async (
    file: File, 
    category: string, 
    documentId?: string
  ): Promise<Document | null> => {
    if (!user) {
      showErrorToast({
        message: "Authentication required to upload documents."
      });
      return null;
    }
    
    setUploading(true);
    try {
      // Upload document
      const document = await documentService.uploadDocument(
        file, 
        category, 
        dealId, 
        user.id,
        documentId
      );
      
      // Notify parent component of document change
      if (notifyDocumentsChange) {
        // Fetch updated documents list
        const updatedDocuments = await documentService.getDocuments(dealId);
        notifyDocumentsChange(updatedDocuments);
      }
      
      showSuccessToast(
        documentId ? "Version added" : "Document uploaded",
        `${file.name} has been successfully uploaded.`
      );
      
      return document;
    } catch (error: any) {
      showErrorToast(error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Save a generated text as a document
   */
  const saveGeneratedTemplate = async (
    content: string,
    filename: string,
    category: string
  ): Promise<Document | null> => {
    // Convert content to a file
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], filename, { type: "text/plain" });
    
    // Use the standard document upload function
    return uploadDocument(file, category);
  };

  return {
    uploading,
    uploadDocument,
    saveGeneratedTemplate
  };
};
