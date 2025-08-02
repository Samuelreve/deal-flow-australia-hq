
import { supabase } from '@/integrations/supabase/client';
import { DocumentComment, DocumentCommentCreateData } from '@/types/documentComment';

/**
 * Fetch all comments for a specific document version
 */
export async function fetchVersionComments(versionId: string): Promise<DocumentComment[]> {
  try {
    console.log('Fetching comments for document version:', versionId);
    
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
      console.error("Error fetching document comments:", error);
      throw error;
    }
    
    console.log('Fetched comments:', data);
    return data || [];
  } catch (error) {
    console.error("Error in fetchVersionComments:", error);
    return [];
  }
}

/**
 * Add a new document comment
 */
export async function addDocumentComment(
  versionId: string, 
  commentData: Partial<DocumentCommentCreateData>, 
  userId: string
): Promise<DocumentComment | null> {
  try {
    console.log('Adding comment for document version:', versionId, commentData);
    
    const { parent_comment_id, content, page_number, location_data, selected_text } = commentData;
    
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_version_id: versionId,
        user_id: userId,
        content,
        page_number,
        location_data,
        parent_comment_id,
      })
      .select('*, user:profiles(id, name, email, avatar_url)')
      .single();
    
    if (error) {
      console.error("Error adding document comment:", error);
      throw error;
    }
    
    console.log('Added comment:', data);
    return data;
  } catch (error) {
    console.error("Error in addDocumentComment:", error);
    return null;
  }
}

/**
 * Edit an existing document comment
 */
export async function editDocumentComment(commentId: string, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    
    if (error) {
      console.error("Error editing comment:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in editDocumentComment:", error);
    return false;
  }
}

/**
 * Delete a document comment
 */
export async function deleteDocumentComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteDocumentComment:", error);
    return false;
  }
}

/**
 * Toggle the resolved status of a comment
 */
export async function toggleCommentResolved(commentId: string): Promise<{ newStatus: boolean }> {
  try {
    // First get the current status
    const { data: comment, error: fetchError } = await supabase
      .from('document_comments')
      .select('resolved')
      .eq('id', commentId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Toggle the status
    const newStatus = !comment.resolved;
    
    const { error: updateError } = await supabase
      .from('document_comments')
      .update({ resolved: newStatus, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    
    if (updateError) {
      throw updateError;
    }
    
    return { newStatus };
  } catch (error) {
    console.error("Error in toggleCommentResolved:", error);
    throw error;
  }
}
