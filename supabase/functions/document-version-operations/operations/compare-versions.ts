
/**
 * Compare two document versions
 */
export function compareVersions(currentContent: string, previousContent: string) {
  if (!currentContent && !previousContent) {
    return {
      additions: [],
      deletions: [],
      unchanged: [],
      differenceSummary: 'Both versions are empty.'
    };
  }
  
  if (!previousContent) {
    return {
      additions: [currentContent],
      deletions: [],
      unchanged: [],
      differenceSummary: 'This is the first version of the document.'
    };
  }
  
  if (!currentContent) {
    return {
      additions: [],
      deletions: [previousContent],
      unchanged: [],
      differenceSummary: 'The current version is empty.'
    };
  }
  
  // Split content into paragraphs for comparison
  const currentLines = currentContent.split(/\n\s*\n/).filter(line => line.trim());
  const previousLines = previousContent.split(/\n\s*\n/).filter(line => line.trim());
  
  const additions = currentLines.filter(line => !previousLines.includes(line));
  const deletions = previousLines.filter(line => !currentLines.includes(line));
  const unchanged = currentLines.filter(line => previousLines.includes(line));
  
  let differenceSummary = '';
  if (additions.length === 0 && deletions.length === 0) {
    differenceSummary = 'No significant changes detected between versions.';
  } else {
    differenceSummary = `Found ${additions.length} additions and ${deletions.length} deletions.`;
  }
  
  return {
    additions,
    deletions,
    unchanged,
    differenceSummary
  };
}
