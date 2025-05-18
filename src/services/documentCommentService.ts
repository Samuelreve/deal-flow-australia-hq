
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface DocumentComment {
  id: string;
  documentVersionId: string;
  userId: string;
  content: string;
  pageNumber?: number;
  locationData?: any;
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  parentCommentId?: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: DocumentComment[];
}

export interface CreateDocumentCommentDto {
  documentVersionId: string;
  content: string;
  pageNumber?: number;
  locationData?: any;
  parentCommentId?: string;
}

/**
 * Service for managing document comments
 */
export const documentCommentService = {
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
      const comments: DocumentComment[] = (commentsData || []).map(comment => ({
        id: comment.id,
        documentVersionId: comment.document_version_id,
        userId: comment.user_id,
        content: comment.content,
        pageNumber: comment.page_number || undefined,
        locationData: comment.location_data,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
        resolved: comment.resolved,
        parentCommentId: comment.parent_comment_id || undefined,
        user: comment.profiles ? {
          id: comment.profiles.id,
          name: comment.profiles.name,
          avatarUrl: comment.profiles.avatar_url
        } : undefined
      }));

      // Organize into threaded structure (top-level comments with replies)
      const threaded: DocumentComment[] = [];
      const commentMap = new Map<string, DocumentComment>();
      
      // First pass: create a map of all comments
      comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });
      
      // Second pass: organize into threads
      comments.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id)!;
        
        if (comment.parentCommentId) {
          // This is a reply, add it to the parent's replies
          const parent = commentMap.get(comment.parentCommentId);
          if (parent) {
            parent.replies!.push(commentWithReplies);
          } else {
            // Parent not found (shouldn't happen with well-formed data)
            threaded.push(commentWithReplies);
          }
        } else {
          // This is a top-level comment
          threaded.push(commentWithReplies);
        }
      });
      
      return threaded.filter(comment => !comment.parentCommentId);
    } catch (error) {
      console.error("Error fetching document comments:", error);
      throw error;
    }
  },

  /**
   * Create a new document comment
   */
  async createComment(newComment: CreateDocumentCommentDto): Promise<DocumentComment> {
    try {
      const userId = supabase.auth.getUser().then(res => res.data.user?.id);
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('document_comments')
        .insert({
          document_version_id: newComment.documentVersionId,
          user_id: await userId,
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

      // Map database response to our service format
      return {
        id: data.id,
        documentVersionId: data.document_version_id,
        userId: data.user_id,
        content: data.content,
        pageNumber: data.page_number || undefined,
        locationData: data.location_data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        resolved: data.resolved,
        parentCommentId: data.parent_comment_id || undefined,
        user: data.profiles ? {
          id: data.profiles.id,
          name: data.profiles.name,
          avatarUrl: data.profiles.avatar_url
        } : undefined,
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
