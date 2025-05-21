import { DocumentVersion, VersionComparisonResult, DocumentVersionTag, DocumentVersionAnnotation } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";
import { documentStorageService } from "./documentStorageService";
import { documentDatabaseService } from "./documentDatabaseService";

/**
 * Service responsible for document version management operations
 */
export const documentVersionManagementService = {
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
  },

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
  },

  /**
   * Add a tag to a document version
   */
  async addVersionTag(
    versionId: string,
    name: string,
    color: string
  ): Promise<DocumentVersionTag | null> {
    try {
      const { data, error } = await supabase
        .from('document_version_tags')
        .insert({
          version_id: versionId,
          name,
          color
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding tag to version:", error);
        return null;
      }
      
      return {
        id: data.id,
        versionId: data.version_id,
        name: data.name,
        color: data.color,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error adding tag to version:", error);
      return null;
    }
  },

  /**
   * Remove a tag from a document version
   */
  async removeVersionTag(tagId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('document_version_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) {
        console.error("Error removing tag from version:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error removing tag from version:", error);
      return false;
    }
  },

  /**
   * Add an annotation to a document version
   */
  async addVersionAnnotation(
    versionId: string,
    userId: string,
    content: string
  ): Promise<DocumentVersionAnnotation | null> {
    try {
      const { data, error } = await supabase
        .from('document_version_annotations')
        .insert({
          version_id: versionId,
          user_id: userId,
          content
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding annotation to version:", error);
        return null;
      }
      
      return {
        id: data.id,
        versionId: data.version_id,
        userId: data.user_id,
        content: data.content,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error adding annotation to version:", error);
      return null;
    }
  }
};
