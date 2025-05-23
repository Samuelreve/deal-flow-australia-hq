import { DocumentComment } from "@/types/documentComment";

/**
 * Adds a new comment to the comments state
 */
export function addCommentToState(
  comments: DocumentComment[],
  newComment: DocumentComment
): DocumentComment[] {
  // If it's a reply, find the parent and add it to its replies
  if (newComment.parent_comment_id) {
    return comments.map(comment => {
      if (comment.id === newComment.parent_comment_id) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
        };
      }
      return comment;
    });
  }
  
  // Otherwise, add it as a new top-level comment
  return [...comments, newComment];
}

/**
 * Updates a comment's content in the state
 */
export function updateCommentInState(
  comments: DocumentComment[],
  commentId: string,
  content: string
): DocumentComment[] {
  return comments.map(comment => {
    // Check if this is the comment to update
    if (comment.id === commentId) {
      return { ...comment, content };
    }
    
    // Check if the comment is in replies
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => 
          reply.id === commentId ? { ...reply, content } : reply
        )
      };
    }
    
    return comment;
  });
}

/**
 * Removes a comment from the state
 */
export function removeCommentFromState(
  comments: DocumentComment[],
  commentId: string,
  parentId?: string | null
): DocumentComment[] {
  // If it's a reply, find the parent and remove it from replies
  if (parentId) {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: (comment.replies || []).filter(
            reply => reply.id !== commentId
          )
        };
      }
      return comment;
    });
  }
  
  // Otherwise, remove the top-level comment
  return comments.filter(comment => comment.id !== commentId);
}

/**
 * Updates a comment's resolved status
 */
export function updateCommentResolvedStatus(
  comments: DocumentComment[],
  commentId: string,
  resolved: boolean
): DocumentComment[] {
  return comments.map(comment => {
    // Check if this is the comment to update
    if (comment.id === commentId) {
      return { ...comment, resolved };
    }
    
    // Check if the comment is in replies
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => 
          reply.id === commentId ? { ...reply, resolved } : reply
        )
      };
    }
    
    return comment;
  });
}

/**
 * Calculate total number of comments (including replies)
 */
export function getCommentCount(comments: DocumentComment[]): number {
  let count = comments.length;
  
  // Add count of all replies
  for (const comment of comments) {
    if (comment.replies && comment.replies.length > 0) {
      count += comment.replies.length;
    }
  }
  
  return count;
}
