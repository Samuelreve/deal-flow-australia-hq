
import { DocumentVersionTag } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for document version tagging
 */
export const versionTaggingService = {
  /**
   * Add a tag to a document version
   */
  async addVersionTag(
    versionId: string,
    name: string,
    color: string
  ): Promise<DocumentVersionTag | null> {
    try {
      // We need to create a custom table for document_version_tags
      // This would be created via SQL migration, not in this code
      
      // For now, use a direct insert to the document_version_tags table
      const { data, error } = await supabase.rpc('add_document_version_tag', {
        p_version_id: versionId,
        p_name: name,
        p_color: color
      });
      
      if (error) {
        console.error("Error adding tag to version:", error);
        return null;
      }
      
      return {
        id: data.id,
        versionId: data.version_id,
        name: data.name,
        color: data.color,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error adding tag to version:", error);
      return null;
    }
  },

  /**
   * Remove a tag from a document version
   */
  async removeVersionTag(tagId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('remove_document_version_tag', {
        p_tag_id: tagId
      });
      
      if (error) {
        console.error("Error removing tag from version:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error removing tag from version:", error);
      return false;
    }
  }
};
