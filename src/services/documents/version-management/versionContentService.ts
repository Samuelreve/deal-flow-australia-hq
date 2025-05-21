
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for retrieving document version content
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
  }
};

// Update the versionComparisonService to use this service
import { versionComparisonService } from './versionComparisonService';
versionComparisonService.getVersionTextContent = versionContentService.getVersionTextContent;
