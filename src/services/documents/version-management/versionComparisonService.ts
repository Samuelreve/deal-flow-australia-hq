
import { VersionComparisonResult } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for comparing document versions
 */
export const versionComparisonService = {
  /**
   * Get text content of a document version
   * This function will be exposed and updated by the versionContentService
   */
  getVersionTextContent: async (versionId: string, dealId: string): Promise<string | null> => {
    // This function will be overwritten by the versionContentService
    return null;
  },

  /**
   * Compare two document versions and return differences
   */
  async compareVersions(
    versionId1: string, 
    versionId2: string, 
    dealId: string
  ): Promise<VersionComparisonResult> {
    try {
      // Call edge function to compare versions
      const { data, error } = await supabase.functions.invoke('document-version-operations', {
        body: { 
          action: 'compare',
          versionId1,
          versionId2,
          dealId
        }
      });
      
      if (error) {
        console.error("Error comparing document versions:", error);
        return {
          additions: [],
          deletions: [],
          unchanged: [],
          differenceSummary: "Error comparing versions"
        };
      }
      
      return data;
    } catch (error) {
      console.error("Error comparing document versions:", error);
      return {
        additions: [],
        deletions: [],
        unchanged: [],
        differenceSummary: "Error comparing versions"
      };
    }
  }
};
