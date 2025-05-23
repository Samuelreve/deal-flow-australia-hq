
import { Highlight, HighlightCategory } from './types';

// Save highlights to local storage
export const saveHighlights = (highlights: Highlight[]): boolean => {
  if (highlights.length === 0) return true;
  
  try {
    localStorage.setItem('contract-highlights', JSON.stringify(highlights));
    return true;
  } catch (error) {
    console.error('Error saving highlights to local storage:', error);
    return false;
  }
};

// Load highlights from local storage
export const loadHighlights = (): Highlight[] => {
  try {
    const savedHighlights = localStorage.getItem('contract-highlights');
    if (savedHighlights) {
      return JSON.parse(savedHighlights);
    }
  } catch (error) {
    console.error('Error loading highlights from local storage:', error);
  }
  
  return [];
};

// Save categories to local storage
export const saveCategories = (categories: HighlightCategory[]): boolean => {
  try {
    localStorage.setItem('highlight-categories', JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error saving categories to local storage:', error);
    return false;
  }
};

// Load categories from local storage
export const loadCategories = (): HighlightCategory[] | null => {
  try {
    const savedCategories = localStorage.getItem('highlight-categories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
  } catch (error) {
    console.error('Error loading categories from local storage:', error);
  }
  
  return null;
};
