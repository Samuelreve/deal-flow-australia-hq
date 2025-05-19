
import { useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useDocumentHighlighting(documentContainerRef: React.RefObject<HTMLDivElement>) {
  // Internal ref for highlighting functionality
  const highlightRef = useRef({
    // This function will be implemented with the actual highlighting logic
    highlightElement: null as HTMLElement | null,
    
    highlightLocation: (locationData: any) => {
      // Remove any existing highlight
      if (highlightRef.current.highlightElement) {
        highlightRef.current.highlightElement.remove();
      }
      
      try {
        if (!locationData) {
          console.warn('No location data provided for highlighting');
          return;
        }
        
        console.log('Highlighting location:', locationData);
        
        if (locationData.selectedText) {
          // Create a highlight overlay
          const highlightElement = document.createElement('div');
          highlightElement.className = 'absolute bg-yellow-200 bg-opacity-50 pointer-events-none transition-opacity duration-300 z-10';
          highlightElement.style.position = 'absolute';
          highlightElement.style.top = `${locationData.rect?.top || 0}px`;
          highlightElement.style.left = `${locationData.rect?.left || 0}px`;
          highlightElement.style.width = `${locationData.rect?.width || 100}px`;
          highlightElement.style.height = `${locationData.rect?.height || 30}px`;
          
          // Add to the document container
          if (documentContainerRef.current) {
            documentContainerRef.current.appendChild(highlightElement);
            highlightRef.current.highlightElement = highlightElement;
            
            // Auto-fade the highlight after a few seconds
            setTimeout(() => {
              if (highlightElement.parentNode) {
                highlightElement.classList.add('opacity-0');
                setTimeout(() => highlightElement.remove(), 1000);
                highlightRef.current.highlightElement = null;
              }
            }, 3000);
          }
        }
        
        // Scroll to the page if page number is available
        if (locationData.pageNumber && documentContainerRef.current) {
          const pageElements = documentContainerRef.current.querySelectorAll('.page');
          if (pageElements.length >= locationData.pageNumber) {
            pageElements[locationData.pageNumber - 1].scrollIntoView({ behavior: 'smooth' });
          }
        }
      } catch (error) {
        console.error('Error highlighting location:', error);
        toast({
          title: "Highlighting Error",
          description: "Could not highlight the selected location",
          variant: "destructive"
        });
      }
    }
  });

  return highlightRef;
}
