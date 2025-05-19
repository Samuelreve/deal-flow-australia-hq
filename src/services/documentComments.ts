
import { supabase } from '@/integrations/supabase/client';

interface CommentCreateData {
  document_version_id: string;
  content: string;
  page_number?: number | null;
  location_data?: any;
  selected_text?: string | null;
}

/**
 * Creates a new document comment
 */
export const createDocumentComment = async (data: CommentCreateData) => {
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
export const getDocumentComments = async (versionId: string) => {
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
