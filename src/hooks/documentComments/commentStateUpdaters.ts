
import { DocumentComment } from '@/types/documentComment';

/**
 * Add a new comment to the state array
 */
export function addCommentToState(
  currentComments: DocumentComment[],
  newComment: DocumentComment
): DocumentComment[] {
  // If it's a reply, find the parent and add it to its replies
  if (newComment.parent_comment_id) {
    return currentComments.map(comment => {
      if (comment.id === newComment.parent_comment_id) {
        // Clone the comment and add the new reply
        const updatedComment = { ...comment };
        updatedComment.replies = [...(updatedComment.replies || []), newComment];
        return updatedComment;
      }
      return comment;
    });
  }
  
  // If it's a top-level comment, just add it to the array
  return [...currentComments, newComment];
}

/**
 * Update a comment's content in the state
 */
export function updateCommentInState(
  currentComments: DocumentComment[],
  commentId: string,
  newContent: string
): DocumentComment[] {
  // First try to update top-level comments
  const updatedComments = currentComments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, content: newContent, updated_at: new Date().toISOString() };
    }
    
    // If this comment has replies, check them too
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return { ...reply, content: newContent, updated_at: new Date().toISOString() };
        }
        return reply;
      });
      
      return { ...comment, replies: updatedReplies };
    }
    
    return comment;
  });
  
  return updatedComments;
}

/**
 * Update a comment's resolved status in the state
 */
export function updateCommentResolvedStatus(
  currentComments: DocumentComment[],
  commentId: string,
  resolved: boolean
): DocumentComment[] {
  // First try to update top-level comments
  const updatedComments = currentComments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, resolved, updated_at: new Date().toISOString() };
    }
    
    // If this comment has replies, check them too
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return { ...reply, resolved, updated_at: new Date().toISOString() };
        }
        return reply;
      });
      
      return { ...comment, replies: updatedReplies };
    }
    
    return comment;
  });
  
  return updatedComments;
}

/**
 * Remove a comment from the state
 */
export function removeCommentFromState(
  currentComments: DocumentComment[],
  commentId: string,
  parentId?: string | null
): DocumentComment[] {
  // If it's a reply, find the parent and remove it from its replies
  if (parentId) {
    return currentComments.map(comment => {
      if (comment.id === parentId) {
        // Clone the comment and filter out the reply
        const updatedComment = { ...comment };
        updatedComment.replies = (updatedComment.replies || []).filter(reply => reply.id !== commentId);
        return updatedComment;
      }
      return comment;
    });
  }
  
  // If it's a top-level comment, just filter it out
  return currentComments.filter(comment => comment.id !== commentId);
}
