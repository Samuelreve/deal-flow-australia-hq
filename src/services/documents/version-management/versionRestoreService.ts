
import { DocumentVersion } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for document version restoration
 */
export const versionRestoreService = {
  /**
   * Restore a document version (make it the latest version)
   */
  async restoreVersion(
    version: DocumentVersion, 
    documentId: string, 
    dealId: string,
    userId: string
  ): Promise<DocumentVersion | null> {
    try {
      // Create a new version based on the restored one
      const { data: restoredVersion, error } = await supabase.functions.invoke('restore-document-version', {
        body: { 
          versionId: version.id,
          documentId,
          dealId,
          userId
        }
      });
      
      if (error) {
        console.error("Error restoring document version:", error);
        throw error;
      }
      
      return restoredVersion;
    } catch (error) {
      console.error("Error restoring document version:", error);
      throw error;
    }
  }
};
