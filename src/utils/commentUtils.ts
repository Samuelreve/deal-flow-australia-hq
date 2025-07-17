import { DocumentComment } from "@/services/documentComment";

/**
 * Centralized comment utility functions
 */

/**
 * Get the total count of comments and their replies
 */
export function getCommentCount(comments: DocumentComment[]): number {
  return comments.reduce((count, comment) => {
    // Count the comment itself
    let totalCount = 1;
    
    // Add count of all replies if they exist
    if (comment.replies && comment.replies.length > 0) {
      totalCount += comment.replies.length;
    }
    
    return count + totalCount;
  }, 0);
}

/**
 * Format date for comment display
 */
export function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Delete a comment via the Supabase Edge Function
 */
export async function deleteComment(commentId: string, accessToken: string): Promise<Response> {
  return fetch(
    `https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/delete-comment/${commentId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
}