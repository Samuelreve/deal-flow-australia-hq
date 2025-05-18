
import { DocumentComment } from "@/services/documentComment";

/**
 * Update comments state when a new comment is added
 */
export const addCommentToState = (
  prevComments: DocumentComment[],
  newComment: DocumentComment
): DocumentComment[] => {
  if (newComment.parentCommentId) {
    // For replies, find parent and add to its replies
    return prevComments.map(comment => 
      comment.id === newComment.parentCommentId 
        ? { 
            ...comment, 
            replies: [...(comment.replies || []), newComment]
          }
        : comment
    );
  } else {
    // For top-level comments, add to the list
    return [...prevComments, newComment];
  }
};

/**
 * Update comments state when a comment is edited
 */
export const updateCommentInState = (
  prevComments: DocumentComment[],
  commentId: string,
  content: string
): DocumentComment[] => {
  return prevComments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, content };
    }
    // Check in replies if not found at top level
    if (comment.replies?.length) {
      const updatedReplies = comment.replies.map(reply => 
        reply.id === commentId ? { ...reply, content } : reply
      );
      return { ...comment, replies: updatedReplies };
    }
    return comment;
  });
};

/**
 * Update comments state when a comment is deleted
 */
export const removeCommentFromState = (
  prevComments: DocumentComment[],
  commentId: string,
  parentId?: string
): DocumentComment[] => {
  if (parentId) {
    // If it's a reply, remove from parent's replies
    return prevComments.map(comment => 
      comment.id === parentId
        ? { 
            ...comment, 
            replies: comment.replies?.filter(reply => reply.id !== commentId) || []
          }
        : comment
    );
  } else {
    // If it's a top-level comment, remove from the list
    return prevComments.filter(comment => comment.id !== commentId);
  }
};

/**
 * Update comments state when a comment's resolved status changes
 */
export const updateCommentResolvedStatus = (
  prevComments: DocumentComment[],
  commentId: string,
  newStatus: boolean
): DocumentComment[] => {
  return prevComments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, resolved: newStatus };
    }
    // Check in replies if not found at top level
    if (comment.replies?.length) {
      const updatedReplies = comment.replies.map(reply => 
        reply.id === commentId ? { ...reply, resolved: newStatus } : reply
      );
      return { ...comment, replies: updatedReplies };
    }
    return comment;
  });
};
