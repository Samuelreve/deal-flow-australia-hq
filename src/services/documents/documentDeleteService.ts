
import { Document, DocumentVersion } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentStorageService } from "./documentStorageService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for document deletion operations
 */
export const documentDeleteService = {
  /**
   * Check if a user can delete a document
   */
  async canDeleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      return await documentDatabaseService.checkUserCanDeleteDocument(documentId, userId);
    } catch (error) {
      console.error("Error checking if user can delete document:", error);
      return false;
    }
  },
  
  /**
   * Delete a document using the secure Edge Function
   */
  async deleteDocument(document: Document, dealId: string, userId: string): Promise<boolean> {
    try {
      // Call the Edge Function to handle the secure deletion with proper RBAC
      const { data, error } = await supabase.functions.invoke('delete-document', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { documentId: document.id }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to delete document");
      }
      
      return data?.success || false;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  /**
   * Delete a document version using the secure Edge Function
   */
  async deleteDocumentVersion(
    versionId: string,
    documentId: string,
    dealId: string, 
    storagePath: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Call the Edge Function to handle the secure deletion with proper RBAC
      const { data, error } = await supabase.functions.invoke('delete-document-version', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { versionId }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to delete document version");
      }
      
      return data?.success || false;
    } catch (error) {
      console.error("Error deleting document version:", error);
      throw error;
    }
  }
};
