
import { DocumentVersionAnnotation } from "@/types/documentVersion";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing document version annotations
 */
export const versionAnnotationService = {
  /**
   * Add an annotation to a document version
   * 
   * @param annotationContent Object containing annotation content
   * @param versionId ID of the version to annotate
   * @param dealId ID of the deal (for authorization)
   * @returns Promise resolving to the created annotation
   */
  async addVersionAnnotation(
    annotationContent: { content: string },
    versionId: string,
    dealId: string
  ): Promise<DocumentVersionAnnotation | null> {
    try {
      // Call the edge function to add annotation
      const { data, error } = await supabase.functions.invoke(
        'document-version-operations',
        {
          body: {
            operation: 'addAnnotation',
            versionId,
            dealId,
            content: annotationContent.content
          }
        }
      );
      
      if (error) {
        throw new Error(error.message || "Failed to add annotation to document version");
      }
      
      return data.annotation as DocumentVersionAnnotation;
    } catch (error) {
      console.error("Error adding annotation to document version:", error);
      throw error;
    }
  },
  
  /**
   * Get all annotations for a document version
   * 
   * @param versionId ID of the version
   * @returns Promise resolving to array of annotations
   */
  async getVersionAnnotations(versionId: string): Promise<DocumentVersionAnnotation[]> {
    try {
      // Call the edge function to get annotations
      const { data, error } = await supabase.functions.invoke(
        'document-version-operations',
        {
          body: {
            operation: 'getAnnotations',
            versionId
          }
        }
      );
      
      if (error) {
        throw new Error(error.message || "Failed to get annotations for document version");
      }
      
      return data.annotations as DocumentVersionAnnotation[] || [];
    } catch (error) {
      console.error("Error getting annotations for document version:", error);
      throw error;
    }
  }
};
