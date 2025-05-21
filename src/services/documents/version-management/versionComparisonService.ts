import { VersionComparisonResult } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for comparing document versions
 */
export const versionComparisonService = {
  /**
   * Compare two document versions and return differences
   */
  async compareVersions(
    versionId1: string, 
    versionId2: string, 
    dealId: string
  ): Promise<VersionComparisonResult> {
    try {
      // First, fetch text content of both versions
      const version1Content = await this.getVersionTextContent(versionId1, dealId);
      const version2Content = await this.getVersionTextContent(versionId2, dealId);
      
      if (!version1Content || !version2Content) {
        throw new Error("Could not retrieve content for both versions");
      }
      
      // Split content into lines for comparison
      const version1Lines = version1Content.split('\n');
      const version2Lines = version2Content.split('\n');
      
      // Simple diff algorithm (this could be replaced with a more sophisticated one)
      const additions: string[] = [];
      const deletions: string[] = [];
      const unchanged: string[] = [];
      
      // Find lines that exist in version2 but not in version1 (additions)
      for (const line of version2Lines) {
        if (!version1Lines.includes(line) && line.trim()) {
          additions.push(line);
        }
      }
      
      // Find lines that exist in version1 but not in version2 (deletions)
      for (const line of version1Lines) {
        if (!version2Lines.includes(line) && line.trim()) {
          deletions.push(line);
        }
      }
      
      // Find unchanged lines
      for (const line of version1Lines) {
        if (version2Lines.includes(line) && line.trim()) {
          unchanged.push(line);
        }
      }
      
      // Generate a summary
      const differenceSummary = `${additions.length} additions, ${deletions.length} deletions, ${unchanged.length} unchanged lines`;
      
      return {
        additions,
        deletions,
        unchanged,
        differenceSummary
      };
    } catch (error) {
      console.error("Error comparing document versions:", error);
      throw error;
    }
  }
};
