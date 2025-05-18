
import { useState, useRef, useCallback, useEffect } from 'react';

interface SelectionData {
  text: string;
  pageNumber?: number;
  locationData: any;
}

interface ButtonPosition {
  top: number;
  left: number;
}

export function useDocumentSelection(currentPage: number) {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  
  const documentContainerRef = useRef<HTMLDivElement>(null);

  // Handle text selection and button positioning
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0 && documentContainerRef.current?.contains(selection?.anchorNode as Node || null)) {
      // Text is selected within the document container
      setSelectedText(text);

      // Try to get the bounding rectangle of the selection
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const containerRect = documentContainerRef.current.getBoundingClientRect();

        // Position the button below and centered on the selection
        setButtonPosition({
          top: rect.bottom - containerRect.top + 5, // 5px below selection
          left: rect.left - containerRect.left + (rect.width / 2), // Center horizontally
        });

        // Store location data for the selection
        setLocationData({
          pageNumber: currentPage,
          rect: {
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left,
            width: rect.width,
            height: rect.height,
          },
          quote: text,
          context: range.startContainer.textContent?.substring(
            Math.max(0, range.startOffset - 50), 
            range.startOffset
          ) + text + range.startContainer.textContent?.substring(
            range.endOffset, 
            Math.min(range.endOffset + 50, (range.startContainer.textContent || '').length)
          ),
          selectedText: text
        });
      } else {
        setButtonPosition(null);
        setLocationData(null);
      }
    } else {
      // No text selected or selection is outside the document container
      setSelectedText(null);
      setButtonPosition(null);
      setLocationData(null);
    }
  }, [currentPage]);

  // Clear selection when document changes
  const clearSelection = useCallback(() => {
    setSelectedText(null);
    setButtonPosition(null);
    setLocationData(null);
  }, []);

  return {
    selectedText,
    buttonPosition,
    locationData,
    documentContainerRef,
    handleMouseUp,
    clearSelection,
    setSelectedText,
    setButtonPosition,
    setLocationData,
  };
}
