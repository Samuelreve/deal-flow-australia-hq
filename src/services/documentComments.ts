
import { supabase } from '@/integrations/supabase/client';
import { DocumentComment, DocumentCommentCreateData } from '@/types/documentComment';

/**
 * Creates a new document comment
 */
export const createDocumentComment = async (data: DocumentCommentCreateData): Promise<DocumentComment> => {
  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error('Authentication required');
  }
  
  const commentData = {
    ...data,
    user_id: userData.user.id
  };
  
  const { data: result, error } = await supabase
    .from('document_comments')
    .insert(commentData)
    .select('*, user:profiles(id, name, email, avatar_url)');
  
  if (error) {
    throw error;
  }
  
  return result[0];
};

/**
 * Get comments for a document version
 */
export const getDocumentComments = async (versionId: string): Promise<DocumentComment[]> => {
  const { data, error } = await supabase
    .from('document_comments')
    .select(`
      *,
      user:profiles(id, name, email, avatar_url),
      replies:document_comments(
        *,
        user:profiles(id, name, email, avatar_url)
      )
    `)
    .eq('document_version_id', versionId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  return data;
};

/**
 * Toggle the resolved status of a comment
 */
export const toggleCommentResolved = async (commentId: string): Promise<boolean> => {
  // First, get the current status
  const { data: currentComment, error: fetchError } = await supabase
    .from('document_comments')
    .select('resolved')
    .eq('id', commentId)
    .single();
  
  if (fetchError) {
    throw fetchError;
  }
  
  // Toggle the status
  const newStatus = !currentComment.resolved;
  
  const { error: updateError } = await supabase
    .from('document_comments')
    .update({ resolved: newStatus })
    .eq('id', commentId);
  
  if (updateError) {
    throw updateError;
  }
  
  return newStatus;
};

/**
 * Update a comment's content
 */
export const updateCommentContent = async (commentId: string, content: string): Promise<void> => {
  const { error } = await supabase
    .from('document_comments')
    .update({ content })
    .eq('id', commentId);
  
  if (error) {
    throw error;
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('document_comments')
    .delete()
    .eq('id', commentId);
  
  if (error) {
    throw error;
  }
};
