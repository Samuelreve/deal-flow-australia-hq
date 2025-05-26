
import { supabase } from "@/integrations/supabase/client";
import { DocumentComment, CreateDocumentCommentDto, DbDocumentComment } from "./types";
import { mapDbCommentToServiceComment } from "./mappers";

/**
 * Service responsible for modifying document comments
 */
export const commentMutationService = {
  /**
   * Create a new document comment
   */
  async createComment(newComment: CreateDocumentCommentDto): Promise<DocumentComment> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('document_comments')
        .insert({
          document_version_id: newComment.documentVersionId,
          user_id: userId,
          content: newComment.content,
          page_number: newComment.pageNumber || null,
          location_data: newComment.locationData || null,
          parent_comment_id: newComment.parentCommentId || null
        })
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
        .single();

      if (error) throw error;

      // Safely map the response - handle the profiles array from Supabase join
      const dbComment: DbDocumentComment = {
        ...data,
        profiles: Array.isArray(data.profiles) && data.profiles.length > 0 
          ? data.profiles[0] 
          : data.profiles || null
      };

      return {
        ...mapDbCommentToServiceComment(dbComment),
        replies: []
      };
    } catch (error) {
      console.error("Error creating document comment:", error);
      throw error;
    }
  },

  /**
   * Update an existing comment
   */
  async updateComment(commentId: string, content: string, resolved?: boolean): Promise<void> {
    try {
      const updates: any = { content };
      if (resolved !== undefined) {
        updates.resolved = resolved;
      }

      const { error } = await supabase
        .from('document_comments')
        .update(updates)
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating document comment:", error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting document comment:", error);
      throw error;
    }
  },

  /**
   * Toggle the resolved status of a comment
   */
  async toggleResolved(commentId: string): Promise<boolean> {
    try {
      // First get the current status
      const { data, error: fetchError } = await supabase
        .from('document_comments')
        .select('resolved')
        .eq('id', commentId)
        .single();

      if (fetchError) throw fetchError;
      
      const newStatus = !data.resolved;
      
      // Then update it
      const { error: updateError } = await supabase
        .from('document_comments')
        .update({ resolved: newStatus })
        .eq('id', commentId);

      if (updateError) throw updateError;
      
      return newStatus;
    } catch (error) {
      console.error("Error toggling comment resolved status:", error);
      throw error;
    }
  }
};
