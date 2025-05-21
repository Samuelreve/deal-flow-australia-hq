
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
    annotation: { content: string },
    versionId: string,
    userId: string
  ): Promise<DocumentVersionAnnotation | null> {
    try {
      // Call edge function to add annotation
      const { data, error } = await supabase.functions.invoke('document-version-operations', {
        body: { 
          action: 'addAnnotation',
          versionId,
          userId,
          annotation
        }
      });
      
      if (error) {
        console.error("Error adding version annotation:", error);
        return null;
      }
      
      if (!data || typeof data !== 'object') {
        console.error("Invalid response adding annotation");
        return null;
      }
      
      // Map the returned data to our application type
      return {
        id: data.id as string,
        versionId: data.versionId as string,
        userId: data.userId as string,
        content: data.content as string,
        createdAt: new Date(data.createdAt as string)
      };
    } catch (error) {
      console.error("Error adding version annotation:", error);
      return null;
    }
  }
};
