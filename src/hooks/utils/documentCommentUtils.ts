
import { DocumentComment } from "@/services/documentComment";

/**
 * Get the total count of comments and their replies
 */
export const getCommentCount = (comments: DocumentComment[]): number => {
  return comments.reduce((count, comment) => {
    // Count the comment itself
    let totalCount = 1;
    
    // Add count of all replies if they exist
    if (comment.replies && comment.replies.length > 0) {
      totalCount += comment.replies.length;
    }
    
    return count + totalCount;
  }, 0);
};
