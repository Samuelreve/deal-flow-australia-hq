
import { useState, useEffect, RefObject } from 'react';

export function useDocumentSelectionState(
  documentContainerRef: RefObject<HTMLDivElement>,
  showCommentInput: boolean,
  showExplanation: boolean,
  setSelectedText: (text: string | null) => void,
  setButtonPosition: (position: { top: number; left: number } | null) => void
) {
  // Effect to clear selection when clicking outside the button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (documentContainerRef.current && !documentContainerRef.current.contains(event.target as Node)) {
        const commentInput = document.getElementById('comment-input-container');
        const explanationDisplay = document.getElementById('explanation-display');
        
        if (
          (!commentInput || !commentInput.contains(event.target as Node)) && 
          (!explanationDisplay || !explanationDisplay.contains(event.target as Node))
        ) {
          if (!showCommentInput && !showExplanation) {
            setSelectedText(null);
            setButtonPosition(null);
          }
        }
      }
    };

    document.body.addEventListener('click', handleClickOutside);
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [documentContainerRef, showCommentInput, showExplanation, setSelectedText, setButtonPosition]);
}
