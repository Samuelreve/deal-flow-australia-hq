
import { supabase } from "@/integrations/supabase/client";
import { DocumentComment, DbDocumentComment } from "./types";
import { mapDbCommentToDocumentComment, organizeCommentsIntoThreads } from "./mappers";

/**
 * Service responsible for retrieving document comments
 */
export const commentRetrievalService = {
  /**
   * Fetch comments for a specific document version
   */
  async getCommentsByVersionId(versionId: string): Promise<DocumentComment[]> {
    try {
      // Fetch all comments for this document version
      const { data: commentsData, error } = await supabase
        .from('document_comments')
        .select(`
          id,
          document_version_id,
          user_id,
          content,
          page_number,
          location_data,
          created_at,
          updated_at,
          resolved,
          parent_comment_id,
          profiles:user_id (id, name, avatar_url)
        `)
        .eq('document_version_id', versionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform database format to our service format
      const comments: DocumentComment[] = (commentsData || [])
        .map((comment: DbDocumentComment) => mapDbCommentToDocumentComment(comment));
      
      // Organize into threaded structure
      return organizeCommentsIntoThreads(comments);
    } catch (error) {
      console.error("Error fetching document comments:", error);
      throw error;
    }
  }
};
