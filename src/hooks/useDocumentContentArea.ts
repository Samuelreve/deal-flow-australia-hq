
import { useRef } from 'react';
import { useDocumentHighlighting } from './useDocumentHighlighting';
import { useDocumentViewerRef } from './useDocumentViewerRef';

export function useDocumentContentArea() {
  // Document container ref
  const documentContainerRef = useRef<HTMLDivElement>(null);
  
  // Setup highlighting and viewer refs
  const highlightRef = useDocumentHighlighting(documentContainerRef);
  
  return {
    documentContainerRef,
    highlightRef
  };
}
