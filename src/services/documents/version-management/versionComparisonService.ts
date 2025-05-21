import { supabase } from "@/integrations/supabase/client";
import { VersionComparisonResult } from "@/types/documentVersion";

/**
 * Service for document version comparison operations
 */
export const versionComparisonService = {
  /**
   * Compare two versions of a document
   */
  async compareVersions(
    currentVersionId: string,
    previousVersionId: string,
    dealId: string
  ): Promise<VersionComparisonResult> {
    try {
      // Basic comparison for text differences
      // This is a simple implementation and could be enhanced
      
      // Get text content of current version
      const currentVersionResponse = await supabase.functions.invoke('document-content-retrieval', {
        body: { versionId: currentVersionId, dealId }
      });
      
      if (currentVersionResponse.error) {
        throw new Error(`Failed to retrieve current version: ${currentVersionResponse.error.message}`);
      }
      
      const currentText = currentVersionResponse.data.content;
      
      // Get text content of previous version
      const previousVersionResponse = await supabase.functions.invoke('document-content-retrieval', {
        body: { versionId: previousVersionId, dealId }
      });
      
      if (previousVersionResponse.error) {
        throw new Error(`Failed to retrieve previous version: ${previousVersionResponse.error.message}`);
      }
      
      const previousText = previousVersionResponse.data.content;
      
      // Simple line-by-line comparison
      const currentLines = currentText.split('\n');
      const previousLines = previousText.split('\n');
      
      const additions: string[] = [];
      const deletions: string[] = [];
      const unchanged: string[] = [];
      
      // Find additions (lines in current but not in previous)
      currentLines.forEach(line => {
        if (line.trim() && !previousLines.includes(line)) {
          additions.push(line);
        }
      });
      
      // Find deletions (lines in previous but not in current)
      previousLines.forEach(line => {
        if (line.trim() && !currentLines.includes(line)) {
          deletions.push(line);
        }
      });
      
      // Find unchanged lines
      previousLines.forEach(line => {
        if (line.trim() && currentLines.includes(line)) {
          unchanged.push(line);
        }
      });
      
      return {
        additions,
        deletions,
        unchanged,
        differenceSummary: `Found ${additions.length} additions, ${deletions.length} deletions, and ${unchanged.length} unchanged sections.`
      };
    } catch (error: any) {
      console.error("Error comparing document versions:", error);
      throw new Error(error.message || "Failed to compare document versions");
    }
  },
  
  /**
   * Get AI-powered summary of changes between two versions
   */
  async getVersionComparisonSummary(
    currentVersionId: string,
    previousVersionId: string,
    dealId: string
  ): Promise<{ summary: string; disclaimer: string }> {
    try {
      // Get the authenticated user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Authentication required");
      }
      
      // Call the AI assistant function to summarize changes
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: { 
          operation: 'summarize_version_changes',
          dealId,
          documentId: "auto", // The function will look it up from the version
          currentVersionId,
          previousVersionId,
          userId: user.id
        }
      });
      
      if (error) {
        throw new Error(`Failed to generate summary: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to generate summary");
      }
      
      return {
        summary: data.summary,
        disclaimer: data.disclaimer
      };
    } catch (error: any) {
      console.error("Error getting version comparison summary:", error);
      throw new Error(error.message || "Failed to get version comparison summary");
    }
  }
};
