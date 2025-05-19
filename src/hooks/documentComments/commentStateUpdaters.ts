
import { DocumentComment } from "@/types/documentComment";

/**
 * Add a new comment to the state
 */
export function addCommentToState(comments: DocumentComment[], newComment: DocumentComment): DocumentComment[] {
  // If it's a reply to an existing comment
  if (newComment.parent_comment_id) {
    // Find the parent comment
    return comments.map(comment => {
      if (comment.id === newComment.parent_comment_id) {
        // Clone the parent and add the reply to its replies array
        return {
          ...comment,
          replies: comment.replies ? [...comment.replies, newComment] : [newComment]
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // Check if the parent is in the replies array (nested comments)
        const updatedReplies = comment.replies.map(reply => {
          if (reply.id === newComment.parent_comment_id) {
            return {
              ...reply,
              replies: reply.replies ? [...reply.replies, newComment] : [newComment]
            };
          }
          return reply;
        });
        
        return {
          ...comment,
          replies: updatedReplies
        };
      }
      
      return comment;
    });
  }
  
  // For top-level comments, simply add to the array
  return [...comments, newComment];
}

/**
 * Update a comment's content in the state
 */
export function updateCommentInState(comments: DocumentComment[], commentId: string, content: string): DocumentComment[] {
  // Check if it's a top-level comment
  const commentToUpdate = comments.find(c => c.id === commentId);
  
  if (commentToUpdate) {
    return comments.map(c => 
      c.id === commentId ? { ...c, content } : c
    );
  }
  
  // Check if it's a reply
  return comments.map(comment => {
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = updateCommentInState(comment.replies, commentId, content);
      
      if (updatedReplies !== comment.replies) {
        return {
          ...comment,
          replies: updatedReplies
        };
      }
    }
    
    return comment;
  });
}

/**
 * Remove a comment from the state
 */
export function removeCommentFromState(
  comments: DocumentComment[], 
  commentId: string, 
  parentId?: string | null
): DocumentComment[] {
  if (parentId) {
    // It's a reply, find the parent and remove from its replies
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies ? comment.replies.filter(r => r.id !== commentId) : []
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // Check nested replies
        return {
          ...comment,
          replies: removeCommentFromState(comment.replies, commentId, parentId)
        };
      }
      
      return comment;
    });
  }
  
  // It's a top-level comment
  return comments.filter(comment => comment.id !== commentId);
}

/**
 * Update a comment's resolved status
 */
export function updateCommentResolvedStatus(
  comments: DocumentComment[], 
  commentId: string, 
  resolved: boolean
): DocumentComment[] {
  // Check if it's a top-level comment
  const commentToUpdate = comments.find(c => c.id === commentId);
  
  if (commentToUpdate) {
    return comments.map(c => 
      c.id === commentId ? { ...c, resolved } : c
    );
  }
  
  // Check if it's a reply
  return comments.map(comment => {
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = updateCommentResolvedStatus(comment.replies, commentId, resolved);
      
      if (updatedReplies !== comment.replies) {
        return {
          ...comment,
          replies: updatedReplies
        };
      }
    }
    
    return comment;
  });
}
