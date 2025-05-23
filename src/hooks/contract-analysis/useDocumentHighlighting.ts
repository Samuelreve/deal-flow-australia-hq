
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Highlight, HighlightCategory } from './types';

const DEFAULT_CATEGORIES: HighlightCategory[] = [
  { id: 'risk', name: 'Risk', color: '#F44336', description: 'Potential legal or business risks' },
  { id: 'obligation', name: 'Obligation', color: '#2196F3', description: 'Legal obligations or requirements' },
  { id: 'key-term', name: 'Key Term', color: '#4CAF50', description: 'Important terms and definitions' },
  { id: 'custom', name: 'Custom', color: '#FFEB3B', description: 'Other highlighted content' }
];

export const useDocumentHighlighting = (contractText: string) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('custom');
  const [activeColor, setActiveColor] = useState<string>('#FFEB3B'); // Default yellow
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  const [categories, setCategories] = useState<HighlightCategory[]>(DEFAULT_CATEGORIES);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [highlightNote, setHighlightNote] = useState<string>('');
  const [showNoteEditor, setShowNoteEditor] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate a unique ID for each highlight
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 11);
  }, []);
  
  // Load highlights from local storage on initial load
  useEffect(() => {
    try {
      const savedHighlights = localStorage.getItem('contract-highlights');
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
      
      const savedCategories = localStorage.getItem('highlight-categories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error('Error loading highlights from local storage:', error);
    }
  }, []);
  
  // Save highlights to local storage when they change
  useEffect(() => {
    if (highlights.length > 0) {
      try {
        localStorage.setItem('contract-highlights', JSON.stringify(highlights));
      } catch (error) {
        console.error('Error saving highlights to local storage:', error);
      }
    }
  }, [highlights]);
  
  // Save categories to local storage when they change
  useEffect(() => {
    try {
      localStorage.setItem('highlight-categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to local storage:', error);
    }
  }, [categories]);
  
  // Update active color when category changes
  useEffect(() => {
    const category = categories.find(c => c.id === activeCategory);
    if (category) {
      setActiveColor(category.color);
    }
  }, [activeCategory, categories]);
  
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
        color: activeColor,
        category: activeCategory as 'risk' | 'obligation' | 'key term' | 'custom',
        note: '',
        createdAt: new Date().toISOString()
      };
      
      setHighlights(prev => [...prev, newHighlight]);
      setSelectedHighlight(newHighlight);
      setHighlightNote('');
      setShowNoteEditor(true);
      
      toast.success('Text highlighted', {
        description: `"${text.length > 30 ? text.substring(0, 30) + '...' : text}"`
      });
      
      // Clear the selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Error creating highlight:', error);
      toast.error('Failed to highlight text');
    }
  }, [activeColor, activeCategory, generateId]);
  
  // Process text selection when in highlight mode
  const handleTextSelection = useCallback(() => {
    if (!isHighlightMode) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    addHighlight(selection);
  }, [isHighlightMode, addHighlight]);
  
  // Update note for highlight
  const updateHighlightNote = useCallback((id: string, note: string) => {
    setHighlights(prev => prev.map(highlight => 
      highlight.id === id ? { ...highlight, note } : highlight
    ));
    setShowNoteEditor(false);
    toast.success('Note saved');
  }, []);
  
  // Remove a highlight
  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
    if (selectedHighlight?.id === id) {
      setSelectedHighlight(null);
      setShowNoteEditor(false);
    }
    toast.info('Highlight removed');
  }, [selectedHighlight]);
  
  // Clear all highlights
  const clearHighlights = useCallback(() => {
    setHighlights([]);
    setSelectedHighlight(null);
    setShowNoteEditor(false);
    toast.info('All highlights cleared');
  }, []);
  
  // Toggle highlight mode
  const toggleHighlightMode = useCallback(() => {
    setIsHighlightMode(prev => !prev);
    if (selectedHighlight) {
      setSelectedHighlight(null);
      setShowNoteEditor(false);
    }
  }, [selectedHighlight]);
  
  // Change active category
  const changeCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);
  
  // Add new category
  const addCategory = useCallback((name: string, color: string, description?: string) => {
    const newCategory: HighlightCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
      description
    };
    
    setCategories(prev => [...prev, newCategory]);
    setActiveCategory(newCategory.id);
    toast.success('Category added');
  }, []);
  
  // Select a highlight to view/edit
  const selectHighlight = useCallback((highlightId: string) => {
    const highlight = highlights.find(h => h.id === highlightId);
    if (highlight) {
      setSelectedHighlight(highlight);
      setHighlightNote(highlight.note || '');
      setShowNoteEditor(true);
    }
  }, [highlights]);
  
  // Get highlights by category
  const getHighlightsByCategory = useCallback((categoryId: string) => {
    return highlights.filter(h => h.category === categoryId);
  }, [highlights]);
  
  // Sort highlights by position in document
  const getSortedHighlights = useCallback(() => {
    return [...highlights].sort((a, b) => a.startIndex - b.startIndex);
  }, [highlights]);
  
  // Get highlight statistics
  const getHighlightStats = useCallback(() => {
    const stats = categories.map(category => ({
      ...category,
      count: highlights.filter(h => h.category === category.id).length
    }));
    
    return stats;
  }, [highlights, categories]);
  
  // Render highlighted text with proper markup
  const renderHighlightedText = useCallback(() => {
    if (!contractText) return "";
    
    // Sort highlights by start index (descending) to process from end to start
    // This ensures we don't mess up indices as we insert highlight markup
    const sortedHighlights = [...highlights].sort((a, b) => b.startIndex - a.startIndex);
    
    let result = contractText;
    
    sortedHighlights.forEach(highlight => {
      const { startIndex, endIndex, color, id, category } = highlight;
      
      if (startIndex >= 0 && endIndex <= result.length) {
        const before = result.substring(0, startIndex);
        const highlighted = result.substring(startIndex, endIndex);
        const after = result.substring(endIndex);
        
        result = `${before}<span data-highlight-id="${id}" data-category="${category}" class="highlighted-text" style="background-color: ${color}; padding: 0 2px; border-radius: 2px; cursor: pointer;">${highlighted}</span>${after}`;
      }
    });
    
    return result;
  }, [contractText, highlights]);
  
  return {
    highlights,
    containerRef,
    categories,
    isHighlightMode,
    activeCategory,
    activeColor,
    selectedHighlight,
    highlightNote,
    showNoteEditor,
    handleTextSelection,
    toggleHighlightMode,
    changeCategory,
    addCategory,
    removeHighlight,
    clearHighlights,
    renderHighlightedText,
    selectHighlight,
    setHighlightNote,
    updateHighlightNote,
    getHighlightsByCategory,
    getSortedHighlights,
    getHighlightStats,
    setShowNoteEditor
  };
};
