/**
 * Centralized date utility functions for consistent date formatting across the application
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

/**
 * Format date with time in a user-friendly format
 */
export function formatDateWithTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Not specified';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date as a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Not specified';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 30) {
    return formatDate(date);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format day of the week, month and day (e.g. "Monday, January 1")
 */
export function formatDayAndMonth(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Today';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Today';
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for comment display (used in comments)
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
 * Format date for milestone display
 */
export function formatMilestoneDate(dateString?: Date | string): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format date for participant display (Australian format)
 */
export function formatParticipantDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date for profile display (US format)
 */
export function formatProfileDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}