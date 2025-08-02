
import { supabase } from '@/integrations/supabase/client';
import { DocumentComment, DocumentCommentCreateData } from '@/types/documentComment';

/**
 * Fetch all comments for a specific document version
 */
export async function fetchVersionComments(versionId: string): Promise<DocumentComment[]> {
  try {
    console.log('Fetching comments for document version:', versionId);
    
    // First fetch all comments for this version, ordered by creation time
    const { data, error } = await supabase
      .from('document_comments')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .eq('document_version_id', versionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching document comments:", error);
      throw error;
    }
    
    console.log('Raw comments data:', data);
    
    // Transform the data to match our DocumentComment interface
    const transformedComments = (data || []).map(comment => ({
      ...comment,
      user: comment.profiles ? {
        id: comment.user_id,
        name: comment.profiles.name,
        avatar_url: comment.profiles.avatar_url
      } : undefined
    }));
    
    // Organize comments into parent-child structure
    const topLevelComments: DocumentComment[] = [];
    const repliesMap = new Map<string, DocumentComment[]>();
    
    // First pass: separate top-level comments and replies
    transformedComments.forEach(comment => {
      if (comment.parent_comment_id) {
        // This is a reply
        if (!repliesMap.has(comment.parent_comment_id)) {
          repliesMap.set(comment.parent_comment_id, []);
        }
        repliesMap.get(comment.parent_comment_id)!.push(comment);
      } else {
        // This is a top-level comment
        topLevelComments.push(comment);
      }
    });
    
    // Second pass: attach replies to their parent comments
    topLevelComments.forEach(comment => {
      const replies = repliesMap.get(comment.id) || [];
      comment.replies = replies;
    });
    
    console.log('Processed comments:', topLevelComments);
    return topLevelComments;
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
      .select('*, profiles(name, avatar_url)')
      .single();
    
    if (error) {
      console.error("Error adding document comment:", error);
      throw error;
    }
    
    // Transform the data to match our DocumentComment interface
    const transformedComment = {
      ...data,
      user: data.profiles ? {
        id: data.user_id,
        name: data.profiles.name,
        avatar_url: data.profiles.avatar_url
      } : undefined
    };
    
    console.log('Added comment:', transformedComment);
    return transformedComment;
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
