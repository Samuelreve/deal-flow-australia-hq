
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/deal";

export interface DocumentMetadata {
  id: string;
  deal_id: string;
  name: string;
  description: string | null;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  size: number;
  type: string;
  status: "draft" | "final" | "signed";
  version: number;
  milestone_id: string | null;
  category?: string;
}

/**
 * Service responsible for database operations related to documents
 */
export const documentDatabaseService = {
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
   * Save document metadata to the database
   */
  async saveDocumentMetadata(metadata: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentMetadata> {
    const { data, error } = await supabase
      .from('documents')
      .insert(metadata)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as DocumentMetadata;
  },

  /**
   * Delete document metadata from the database
   */
  async deleteDocumentMetadata(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) {
      throw error;
    }
  }
};
