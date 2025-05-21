
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for document version restoration operations
 */
export const versionRestoreService = {
  /**
   * Restore a previous document version
   * 
   * @param versionId ID of the version to restore
   * @param documentId ID of the document
   * @param dealId ID of the deal
   * @param userId ID of the user performing the restore
   * @returns Promise resolving to boolean success indicator
   */
  async restoreVersion(
    versionId: string, 
    documentId: string,
    dealId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Call the edge function to restore the version
      const { data, error } = await supabase.functions.invoke('restore-document-version', {
        body: {
          versionId,
          documentId,
          dealId,
          userId
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to restore document version");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to restore document version");
      }

      return true;
    } catch (error) {
      console.error("Error restoring document version:", error);
      throw error;
    }
  }
};
