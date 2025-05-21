
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
      
      // Provide a default if data is missing or incomplete
      if (!data || !data.result) {
        return {
          additions: [],
          deletions: [],
          unchanged: [],
          differenceSummary: "Unable to generate comparison results."
        };
      }
      
      return data.result as VersionComparisonResult;
    } catch (error) {
      console.error("Error comparing document versions:", error);
      throw error;
    }
  },

  /**
   * Get an AI-generated summary of changes between two document versions
   * 
   * @param currentVersionId ID of the current version
   * @param previousVersionId ID of the previous version to compare with
   * @param dealId ID of the deal (for authorization)
   * @returns Promise resolving to the AI-generated summary
   */
  async getVersionComparisonSummary(
    currentVersionId: string,
    previousVersionId: string,
    dealId: string
  ): Promise<{ summary: string; disclaimer: string }> {
    try {
      // Call the edge function to summarize version changes
      const { data, error } = await supabase.functions.invoke(
        'document-version-operations',
        {
          body: {
            operation: 'summarize_changes',
            currentVersionId,
            previousVersionId,
            dealId
          }
        }
      );
      
      if (error) {
        throw new Error(error.message || "Failed to summarize version changes");
      }
      
      if (!data || !data.summary) {
        return {
          summary: "Unable to generate comparison summary.",
          disclaimer: "No analysis could be performed."
        };
      }
      
      return {
        summary: data.summary,
        disclaimer: data.disclaimer || "This summary is provided for informational purposes only and should not be considered legal advice."
      };
    } catch (error) {
      console.error("Error summarizing version changes:", error);
      throw error;
    }
  }
};
