
/**
 * Format a date string to a localized display format
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Delete a comment via the Supabase Edge Function
 */
export const deleteComment = async (commentId: string, accessToken: string): Promise<Response> => {
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
};
