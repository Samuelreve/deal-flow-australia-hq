
import { Highlight, HighlightCategory } from './types';
import { escapeHtml } from '@/lib/sanitize';

// Generate a unique ID for each highlight
export const generateHighlightId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Render highlighted text with proper markup
export const renderHighlightedText = (
  contractText: string,
  highlights: Highlight[]
): string => {
  if (!contractText) return "";
  
  // Escape the contract text first to prevent XSS
  const escapedText = escapeHtml(contractText);
  
  // Sort highlights by start index (descending) to process from end to start
  // This ensures we don't mess up indices as we insert highlight markup
  const sortedHighlights = [...highlights].sort((a, b) => b.startIndex - a.startIndex);
  
  let result = escapedText;
  
  sortedHighlights.forEach(highlight => {
    const { startIndex, endIndex, color, id, category } = highlight;
    
    if (startIndex >= 0 && endIndex <= result.length) {
      const before = result.substring(0, startIndex);
      const highlighted = result.substring(startIndex, endIndex);
      const after = result.substring(endIndex);
      
      // Color and category are internal values, not user input, so they're safe
      result = `${before}<span data-highlight-id="${escapeHtml(id)}" data-category="${escapeHtml(category)}" class="highlighted-text" style="background-color: ${color}; padding: 0 2px; border-radius: 2px; cursor: pointer;">${highlighted}</span>${after}`;
    }
  });
  
  return result;
};

// Get highlights statistics
export const getHighlightStats = (
  highlights: Highlight[],
  categories: HighlightCategory[]
) => {
  return categories.map(category => ({
    ...category,
    count: highlights.filter(h => h.category === category.id).length
  }));
};

// Create a new highlight from selection
export const createHighlightFromSelection = (
  selection: Selection,
  containerRef: React.RefObject<HTMLDivElement>,
  activeCategory: string,
  activeColor: string,
  generateId: () => string
): Highlight | null => {
  try {
    // Get the selected text
    const text = selection.toString();
    if (!text || text.length === 0) return null;
    
    // We need to find where in the document this text appears
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerRef.current as Node);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const startIndex = preSelectionRange.toString().length;
    
    return {
      id: generateId(),
      text,
      startIndex,
      endIndex: startIndex + text.length,
      color: activeColor,
      category: activeCategory as 'risk' | 'obligation' | 'key term' | 'custom',
      note: '',
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating highlight from selection:', error);
    return null;
  }
};
