
import { supabase } from '@/integrations/supabase/client';

export interface CommentCreateData {
  document_version_id: string;
  content: string;
  page_number?: number | null;
  location_data?: any;
  selected_text?: string | null;
  parent_comment_id?: string | null;
}

export const createDocumentComment = async (commentData: CommentCreateData) => {
  try {
    const { data, error } = await supabase
      .from('document_comments')
      .insert(commentData)
      .select(`
        id, 
        content, 
        created_at,
        page_number,
        location_data,
        resolved,
        user_id,
        profiles:user_id (id, name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      createdAt: data.created_at,
      pageNumber: data.page_number,
      locationData: data.location_data,
      resolved: data.resolved || false,
      user: {
        id: data.profiles.id,
        name: data.profiles.name,
        avatarUrl: data.profiles.avatar_url
      }
    };
  } catch (error) {
    console.error('Error creating document comment:', error);
    throw error;
  }
};

export const getDocumentComments = async (versionId: string) => {
  try {
    const { data, error } = await supabase
      .from('document_comments')
      .select(`
        id, 
        content, 
        created_at,
        page_number,
        location_data,
        resolved,
        user_id,
        parent_comment_id,
        profiles:user_id (id, name, avatar_url)
      `)
      .eq('document_version_id', versionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Transform to client-friendly format and organize replies
    const comments = [];
    const repliesMap = {};
    
    data.forEach(comment => {
      const formattedComment = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        pageNumber: comment.page_number,
        locationData: comment.location_data,
        resolved: comment.resolved || false,
        user: {
          id: comment.profiles?.id,
          name: comment.profiles?.name || 'User',
          avatarUrl: comment.profiles?.avatar_url
        },
        parentCommentId: comment.parent_comment_id,
        replies: []
      };
      
      if (comment.parent_comment_id) {
        // This is a reply
        if (!repliesMap[comment.parent_comment_id]) {
          repliesMap[comment.parent_comment_id] = [];
        }
        repliesMap[comment.parent_comment_id].push(formattedComment);
      } else {
        // This is a top-level comment
        comments.push(formattedComment);
      }
    });
    
    // Add replies to their parent comments
    comments.forEach(comment => {
      if (repliesMap[comment.id]) {
        comment.replies = repliesMap[comment.id];
      }
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching document comments:', error);
    throw error;
  }
};
