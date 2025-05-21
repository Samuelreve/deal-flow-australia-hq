
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for document version restoration operations
 */
export const versionContentService = {
  /**
   * Get text content of a document version
   */
  async getVersionTextContent(versionId: string, dealId: string): Promise<string | null> {
    try {
      // Call edge function to get text content
      const { data, error } = await supabase.functions.invoke('document-content-retrieval', {
        body: { 
          versionId,
          dealId
        }
      });
      
      if (error) {
        console.error("Error fetching document content:", error);
        return null;
      }
      
      return data.content;
    } catch (error) {
      console.error("Error fetching document content:", error);
      return null;
    }
  },
  
  /**
   * Compare two versions of a document
   */
  async compareVersions(currentVersionId: string, previousVersionId: string, dealId: string) {
    try {
      // Call edge function to compare versions
      const { data, error } = await supabase.functions.invoke('document-version-comparison', {
        body: { 
          currentVersionId,
          previousVersionId,
          dealId
        }
      });
      
      if (error) {
        console.error("Error comparing document versions:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error comparing document versions:", error);
      return null;
    }
  }
};
