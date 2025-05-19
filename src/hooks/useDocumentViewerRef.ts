
import { useRef, useImperativeHandle, ForwardedRef } from 'react';
import { DocumentViewerRef } from '@/components/documents/DocumentViewer';

export function useDocumentViewerRef(
  highlightRef: React.MutableRefObject<{
    highlightElement: HTMLElement | null;
    highlightLocation: (locationData: any) => void;
  }>,
  ref: ForwardedRef<DocumentViewerRef>
) {
  // Create a mutable ref that will store the methods exposed via useImperativeHandle
  const internalDocumentViewerRef = useRef<DocumentViewerRef | null>(null);
  
  // Expose the highlightLocation method via ref
  useImperativeHandle(ref, () => {
    // Create an object that implements DocumentViewerRef interface
    const refValue: DocumentViewerRef = {
      highlightLocation: (locationData: any) => {
        highlightRef.current.highlightLocation(locationData);
      }
    };
    
    // Store the ref value in our internal ref so we can use it in the component
    internalDocumentViewerRef.current = refValue;
    
    // Return the ref value
    return refValue;
  });

  return internalDocumentViewerRef;
}
