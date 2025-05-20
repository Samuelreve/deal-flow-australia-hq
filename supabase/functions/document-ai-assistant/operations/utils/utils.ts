
/**
 * Utility functions for document AI operations
 */

/**
 * Format date in a user-friendly format
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Not specified';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}
