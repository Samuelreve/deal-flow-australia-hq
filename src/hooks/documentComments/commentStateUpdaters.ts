import { DocumentComment } from '@/types/documentComment';

/**
 * Add a new comment to the state
 */
export const addCommentToState = (
  prevComments: DocumentComment[], 
  newComment: DocumentComment
): DocumentComment[] => {
  // If it's a reply, find the parent comment and add to its replies
  if (newComment.parent_comment_id) {
    return prevComments.map(comment => {
      if (comment.id === newComment.parent_comment_id) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
        };
      }
      return comment;
    });
  }
  
  // Otherwise, add as a top-level comment
  return [...prevComments, newComment];
};

/**
 * Update an existing comment's content in the state
 */
export const updateCommentInState = (
  prevComments: DocumentComment[],
  commentId: string,
  content: string
): DocumentComment[] => {
  // Check if it's a top-level comment
  const topLevelComment = prevComments.find(comment => comment.id === commentId);
  
  if (topLevelComment) {
    // Update top-level comment
    return prevComments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, content };
      }
      return comment;
    });
  }
  
  // Check if it's a reply
  return prevComments.map(comment => {
    if (comment.replies?.some(reply => reply.id === commentId)) {
      return {
        ...comment,
        replies: comment.replies.map(reply => {
          if (reply.id === commentId) {
            return { ...reply, content };
          }
          return reply;
        })
      };
    }
    return comment;
  });
};

/**
 * Remove a comment from the state
 */
export const removeCommentFromState = (
  prevComments: DocumentComment[],
  commentId: string,
  parentId?: string
): DocumentComment[] => {
  // If it has a parent ID, it's a reply
  if (parentId) {
    return prevComments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: (comment.replies || []).filter(reply => reply.id !== commentId)
        };
      }
      return comment;
    });
  }
  
  // Otherwise it's a top-level comment
  return prevComments.filter(comment => comment.id !== commentId);
};

/**
 * Update a comment's resolved status
 */
export const updateCommentResolvedStatus = (
  prevComments: DocumentComment[],
  commentId: string,
  resolved: boolean
): DocumentComment[] => {
  return prevComments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, resolved };
    }
    return comment;
  });
};
