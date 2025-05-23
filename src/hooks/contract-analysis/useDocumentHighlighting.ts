
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Highlight, HighlightCategory } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { 
  generateHighlightId,
  renderHighlightedText,
  getHighlightStats,
  createHighlightFromSelection
} from './highlightUtils';
import {
  saveHighlights,
  loadHighlights,
  saveCategories,
  loadCategories
} from './highlightStorage';

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
  
  // Load highlights from local storage on initial load
  useEffect(() => {
    const loadedHighlights = loadHighlights();
    if (loadedHighlights.length > 0) {
      setHighlights(loadedHighlights);
    }
    
    const loadedCategories = loadCategories();
    if (loadedCategories) {
      setCategories(loadedCategories);
    }
  }, []);
  
  // Save highlights to local storage when they change
  useEffect(() => {
    saveHighlights(highlights);
  }, [highlights]);
  
  // Save categories to local storage when they change
  useEffect(() => {
    saveCategories(categories);
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
    const newHighlight = createHighlightFromSelection(
      selection,
      containerRef,
      activeCategory,
      activeColor,
      generateHighlightId
    );
    
    if (newHighlight) {
      setHighlights(prev => [...prev, newHighlight]);
      setSelectedHighlight(newHighlight);
      setHighlightNote('');
      setShowNoteEditor(true);
      
      toast.success('Text highlighted', {
        description: `"${newHighlight.text.length > 30 ? newHighlight.text.substring(0, 30) + '...' : newHighlight.text}"`
      });
      
      // Clear the selection
      window.getSelection()?.removeAllRanges();
    }
  }, [activeColor, activeCategory]);
  
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
    renderHighlightedText: () => renderHighlightedText(contractText, highlights),
    selectHighlight,
    setHighlightNote,
    updateHighlightNote,
    getHighlightsByCategory: useCallback((categoryId: string) => {
      return highlights.filter(h => h.category === categoryId);
    }, [highlights]),
    getSortedHighlights: useCallback(() => {
      return [...highlights].sort((a, b) => a.startIndex - b.startIndex);
    }, [highlights]),
    getHighlightStats: useCallback(() => {
      return getHighlightStats(highlights, categories);
    }, [highlights, categories]),
    setShowNoteEditor
  };
};
