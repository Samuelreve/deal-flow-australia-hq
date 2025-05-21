
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
    tag: { name: string, color: string },
    versionId: string,
    userId: string
  ): Promise<DocumentVersionTag | null> {
    try {
      // Call edge function to add tag
      const { data, error } = await supabase.functions.invoke('document-version-operations', {
        body: { 
          action: 'addTag',
          versionId,
          userId,
          tag
        }
      });
      
      if (error) {
        console.error("Error adding version tag:", error);
        return null;
      }
      
      if (!data || typeof data !== 'object') {
        console.error("Invalid response adding tag");
        return null;
      }
      
      // Map the returned data to our application type
      return {
        id: data.id as string,
        versionId: data.versionId as string,
        name: data.name as string,
        color: data.color as string,
        createdAt: new Date(data.createdAt as string)
      };
    } catch (error) {
      console.error("Error adding version tag:", error);
      return null;
    }
  },
  
  /**
   * Remove a tag from a document version
   */
  async removeVersionTag(tagId: string, versionId: string): Promise<boolean> {
    try {
      // Call edge function to remove tag
      const { error } = await supabase.functions.invoke('document-version-operations', {
        body: { 
          action: 'removeTag',
          tagId,
          versionId
        }
      });
      
      if (error) {
        console.error("Error removing version tag:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error removing version tag:", error);
      return false;
    }
  }
};
