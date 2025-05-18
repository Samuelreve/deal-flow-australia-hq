
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for document deletion operations
 */
export const documentDeletionService = {
  /**
   * Delete document metadata from the database
   */
  async deleteDocumentMetadata(documentId: string): Promise<void> {
    // Deleting the document will cascade and delete all its versions
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) {
      throw error;
    }
  },

  /**
   * Delete a specific document version
   */
  async deleteDocumentVersion(versionId: string, documentId: string): Promise<void> {
    // Check if this is the latest version
    const { data: document } = await supabase
      .from('documents')
      .select('latest_version_id')
      .eq('id', documentId)
      .single();
    
    // Delete the version
    const { error } = await supabase
      .from('document_versions')
      .delete()
      .eq('id', versionId);
    
    if (error) {
      throw error;
    }
    
    // If this was the latest version, update the document to point to the new latest version
    if (document && document.latest_version_id === versionId) {
      // Find the new latest version (highest version number)
      const { data: versions } = await supabase
        .from('document_versions')
        .select('id')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      // Update the document's latest_version_id
      if (versions && versions.length > 0) {
        await supabase
          .from('documents')
          .update({ latest_version_id: versions[0].id })
          .eq('id', documentId);
      } else {
        // No versions left, set latest_version_id to null
        await supabase
          .from('documents')
          .update({ latest_version_id: null })
          .eq('id', documentId);
      }
    }
  }
};
