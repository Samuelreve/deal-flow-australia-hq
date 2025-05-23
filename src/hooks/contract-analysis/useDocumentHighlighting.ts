
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

type Highlight = {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  color: string;
};

type HighlightConfig = {
  colors: string[];
  defaultColor: string;
};

export const useDocumentHighlighting = (contractText: string) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeColor, setActiveColor] = useState<string>('#FFEB3B'); // Default yellow
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Default highlight colors
  const highlightConfig: HighlightConfig = {
    colors: ['#FFEB3B', '#4CAF50', '#2196F3', '#F44336', '#9C27B0'],
    defaultColor: '#FFEB3B'
  };
  
  // Generate a unique ID for each highlight
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 11);
  }, []);
  
  // Add a new highlight
  const addHighlight = useCallback((selection: Selection) => {
    try {
      // Get the selected text
      const text = selection.toString();
      if (!text || text.length === 0) return;
      
      // We need to find where in the document this text appears
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(containerRef.current as Node);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const startIndex = preSelectionRange.toString().length;
      
      const newHighlight: Highlight = {
        id: generateId(),
        text,
        startIndex,
        endIndex: startIndex + text.length,
        color: activeColor
      };
      
      setHighlights(prev => [...prev, newHighlight]);
      
      toast.success('Text highlighted', {
        description: `"${text.length > 30 ? text.substring(0, 30) + '...' : text}"`
      });
      
      // Clear the selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Error creating highlight:', error);
      toast.error('Failed to highlight text');
    }
  }, [activeColor, generateId]);
  
  // Process text selection when in highlight mode
  const handleTextSelection = useCallback(() => {
    if (!isHighlightMode) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    addHighlight(selection);
  }, [isHighlightMode, addHighlight]);
  
  // Remove a highlight
  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
    toast.info('Highlight removed');
  }, []);
  
  // Clear all highlights
  const clearHighlights = useCallback(() => {
    setHighlights([]);
    toast.info('All highlights cleared');
  }, []);
  
  // Toggle highlight mode
  const toggleHighlightMode = useCallback(() => {
    setIsHighlightMode(prev => !prev);
  }, []);
  
  // Change active highlight color
  const changeHighlightColor = useCallback((color: string) => {
    setActiveColor(color);
  }, []);
  
  // Render highlighted text with proper markup
  const renderHighlightedText = useCallback(() => {
    if (!contractText) return "";
    
    // Sort highlights by start index (descending) to process from end to start
    // This ensures we don't mess up indices as we insert highlight markup
    const sortedHighlights = [...highlights].sort((a, b) => b.startIndex - a.startIndex);
    
    let result = contractText;
    
    sortedHighlights.forEach(highlight => {
      const { startIndex, endIndex, color, id } = highlight;
      
      if (startIndex >= 0 && endIndex <= result.length) {
        const before = result.substring(0, startIndex);
        const highlighted = result.substring(startIndex, endIndex);
        const after = result.substring(endIndex);
        
        result = `${before}<span data-highlight-id="${id}" style="background-color: ${color}; padding: 0 2px; border-radius: 2px;">${highlighted}</span>${after}`;
      }
    });
    
    return result;
  }, [contractText, highlights]);
  
  return {
    highlights,
    containerRef,
    highlightConfig,
    isHighlightMode,
    activeColor,
    handleTextSelection,
    toggleHighlightMode,
    changeHighlightColor,
    removeHighlight,
    clearHighlights,
    renderHighlightedText
  };
};
