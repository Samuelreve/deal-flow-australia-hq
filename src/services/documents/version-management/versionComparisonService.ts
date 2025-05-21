
import { VersionComparisonResult } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for comparing document versions
 */
export const versionComparisonService = {
  /**
   * Compare two document versions
   * 
   * @param currentVersionId ID of the current version
   * @param previousVersionId ID of the previous version to compare with
   * @param dealId ID of the deal (for authorization)
   * @returns Promise resolving to comparison results
   */
  async compareVersions(
    currentVersionId: string, 
    previousVersionId: string,
    dealId: string
  ): Promise<VersionComparisonResult> {
    try {
      // Call the edge function to compare versions
      const { data, error } = await supabase.functions.invoke(
        'document-version-operations',
        {
          body: {
            operation: 'compare',
            currentVersionId,
            previousVersionId,
            dealId
          }
        }
      );
      
      if (error) {
        throw new Error(error.message || "Failed to compare document versions");
      }
      
      return data.result as VersionComparisonResult;
    } catch (error) {
      console.error("Error comparing document versions:", error);
      throw error;
    }
  }
};
