
import { supabase } from '@/integrations/supabase/client';
import { CreateDocumentCommentDto } from './types';
import { DocumentComment, ProfileSummary } from '@/types/documentComment';

/**
 * Add a new document comment
 */
export const addDocumentComment = async (
  comment: CreateDocumentCommentDto
): Promise<DocumentComment | null> => {
  try {
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_version_id: comment.documentVersionId,
        content: comment.content,
        page_number: comment.pageNumber,
        location_data: comment.locationData,
        parent_comment_id: comment.parentCommentId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    // Handle the profiles data which could be an object or array
    let profileData: ProfileSummary | null = null;
    if (data.profiles) {
      if (Array.isArray(data.profiles) && data.profiles.length > 0) {
        const profile = data.profiles[0];
        profileData = {
          id: profile.id,
          name: profile.name,
          avatar_url: profile.avatar_url
        };
      } else if (!Array.isArray(data.profiles)) {
        profileData = {
          id: data.profiles.id,
          name: data.profiles.name,
          avatar_url: data.profiles.avatar_url
        };
      }
    }

    return {
      id: data.id,
      content: data.content,
      document_version_id: data.document_version_id,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      page_number: data.page_number,
      location_data: data.location_data,
      resolved: data.resolved,
      parent_comment_id: data.parent_comment_id,
      user: profileData ? {
        id: profileData.id,
        name: profileData.name,
        avatar_url: profileData.avatar_url
      } : undefined
    };
  } catch (error: any) {
    console.error('Failed to add comment:', error);
    return null;
  }
};

/**
 * Update a document comment
 */
export const updateDocumentComment = async (
  commentId: string, 
  content: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('document_comments')
      .update({ content })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Failed to update comment:', error);
    return false;
  }
};

/**
 * Delete a document comment
 */
export const deleteDocumentComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Failed to delete comment:', error);
    return false;
  }
};

/**
 * Toggle resolved status of a comment
 */
export const toggleCommentResolved = async (commentId: string): Promise<{ newStatus?: boolean }> => {
  try {
    // First get the current status
    const { data: currentComment, error: fetchError } = await supabase
      .from('document_comments')
      .select('resolved')
      .eq('id', commentId)
      .single();

    if (fetchError) {
      console.error('Error fetching comment:', fetchError);
      return {};
    }

    const newStatus = !currentComment.resolved;

    const { error } = await supabase
      .from('document_comments')
      .update({ resolved: newStatus })
      .eq('id', commentId);

    if (error) {
      console.error('Error toggling comment resolved status:', error);
      return {};
    }

    return { newStatus };
  } catch (error: any) {
    console.error('Failed to toggle comment resolved status:', error);
    return {};
  }
};
