
/**
 * Utility function to format answers consistently across the application
 */
export const formatAnswerText = (answer: string | { answer: string; sources?: string[] } | null): string => {
  if (answer === null) {
    return 'No response available';
  }
  if (typeof answer === 'string') {
    return answer;
  }
  return answer.answer || 'No response available';
};

/**
 * Extract sources from an answer object
 */
export const extractSources = (answer: string | { answer: string; sources?: string[] } | null): string[] => {
  if (answer === null || typeof answer === 'string') {
    return [];
  }
  return answer.sources || [];
};
