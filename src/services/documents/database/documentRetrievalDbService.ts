
import { supabase } from "@/integrations/supabase/client";
import type { DocumentMetadata, DocumentVersionMetadata } from "../documentDatabaseTypes";

/**
 * Service for document retrieval database operations
 */
export const documentRetrievalDbService = {
  /**
   * Fetch all documents for a deal
   */
  async fetchDocuments(dealId: string): Promise<DocumentMetadata[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as DocumentMetadata[];
  },

  /**
   * Fetch all versions for a document
   */
  async fetchDocumentVersions(documentId: string): Promise<DocumentVersionMetadata[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as DocumentVersionMetadata[];
  }
};
