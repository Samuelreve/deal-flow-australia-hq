
import { supabase } from "@/integrations/supabase/client";
import type { DocumentMetadata, DocumentVersionMetadata } from "../documentDatabaseTypes";

/**
 * Service for document creation and storage operations
 */
export const documentCreationService = {
  /**
   * Save document metadata to the database
   */
  async saveDocumentMetadata(metadata: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at' | 'latest_version_id'>): Promise<DocumentMetadata> {
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
   * Save document version metadata to the database
   */
  async saveDocumentVersion(
    versionData: Omit<DocumentVersionMetadata, 'id' | 'created_at' | 'uploaded_at'>
  ): Promise<DocumentVersionMetadata> {
    const { data, error } = await supabase
      .from('document_versions')
      .insert(versionData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Update the document's latest_version_id
    const { error: updateError } = await supabase
      .from('documents')
      .update({ latest_version_id: data.id })
      .eq('id', versionData.document_id);
    
    if (updateError) {
      console.error("Error updating document's latest version:", updateError);
      // Continue anyway to return the version that was created
    }
    
    return data as DocumentVersionMetadata;
  }
};
