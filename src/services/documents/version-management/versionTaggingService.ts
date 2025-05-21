
import { DocumentVersionTag } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing document version tags
 */
export const versionTaggingService = {
  /**
   * Add a tag to a document version
   * 
   * @param tag Object containing tag name and color
   * @param versionId ID of the version to tag
   * @param dealId ID of the deal (for authorization)
   * @returns Promise resolving to the created tag
   */
  async addVersionTag(
    tag: { name: string, color: string },
    versionId: string,
    dealId: string
  ): Promise<DocumentVersionTag | null> {
    try {
      // Call the edge function to add tag
      const { data, error } = await supabase.functions.invoke(
        'document-version-operations',
        {
          body: {
            operation: 'addTag',
            versionId,
            dealId,
            tag
          }
        }
      );
      
      if (error) {
        throw new Error(error.message || "Failed to add tag to document version");
      }
      
      return data.tag as DocumentVersionTag;
    } catch (error) {
      console.error("Error adding tag to document version:", error);
      throw error;
    }
  },
  
  /**
   * Remove a tag from a document version
   * 
   * @param tagId ID of the tag to remove
   * @param versionId ID of the version
   * @returns Promise resolving to boolean success indicator
   */
  async removeVersionTag(tagId: string, versionId: string): Promise<boolean> {
    try {
      // Call the edge function to remove tag
      const { data, error } = await supabase.functions.invoke(
        'document-version-operations',
        {
          body: {
            operation: 'removeTag',
            tagId,
            versionId
          }
        }
      );
      
      if (error) {
        throw new Error(error.message || "Failed to remove tag from document version");
      }
      
      return data.success || false;
    } catch (error) {
      console.error("Error removing tag from document version:", error);
      throw error;
    }
  }
};
