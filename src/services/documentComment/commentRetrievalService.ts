
import { supabase } from "@/integrations/supabase/client";
import { DocumentComment, DbDocumentComment } from "./types";
import { mapDbCommentToServiceComment } from "./mappers";

/**
 * Organize comments into a threaded structure with parents and replies
 */
export const organizeCommentsIntoThreads = (comments: DocumentComment[]): DocumentComment[] => {
  // First, separate top-level comments and replies
  const parentComments: DocumentComment[] = [];
  const replies: Record<string, DocumentComment[]> = {};

  // Group comments by parent ID
  comments.forEach(comment => {
    if (!comment.parent_comment_id) {
      // This is a top-level comment
      parentComments.push({...comment, replies: []});
    } else {
      // This is a reply
      if (!replies[comment.parent_comment_id]) {
        replies[comment.parent_comment_id] = [];
      }
      replies[comment.parent_comment_id].push(comment);
    }
  });

  // Attach replies to their parent comments
  parentComments.forEach(parentComment => {
    if (replies[parentComment.id]) {
      parentComment.replies = replies[parentComment.id];
    }
  });

  return parentComments;
};

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

      // Transform database format to our service format - handle the profiles array from Supabase join
      const comments: DocumentComment[] = (commentsData || [])
        .map((comment: any) => {
          const dbComment: DbDocumentComment = {
            ...comment,
            profiles: Array.isArray(comment.profiles) && comment.profiles.length > 0 
              ? comment.profiles[0] 
              : comment.profiles || null
          };
          return mapDbCommentToServiceComment(dbComment);
        });
      
      // Organize into threaded structure
      return organizeCommentsIntoThreads(comments);
    } catch (error) {
      console.error("Error fetching document comments:", error);
      throw error;
    }
  }
};
