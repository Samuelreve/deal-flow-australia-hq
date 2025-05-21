
import { DocumentVersionAnnotation } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for document version annotations
 */
export const versionAnnotationService = {
  /**
   * Add an annotation to a document version
   */
  async addVersionAnnotation(
    versionId: string,
    userId: string,
    content: string
  ): Promise<DocumentVersionAnnotation | null> {
    try {
      // We need to create a custom table for document_version_annotations
      // This would be created via SQL migration, not in this code
      
      // For now, use a direct RPC call
      const { data, error } = await supabase.rpc('add_document_version_annotation', {
        p_version_id: versionId,
        p_user_id: userId,
        p_content: content
      });
      
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
