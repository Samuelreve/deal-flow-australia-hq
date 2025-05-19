import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import DocumentAIExplanation from './DocumentAIExplanation';
import DocumentCommentsSidebar from './DocumentCommentsSidebar';
import DocumentViewerContent from './DocumentViewerContent';
import DocumentViewerHeader from './DocumentViewerHeader';
import { useDocumentViewerState } from '@/hooks/useDocumentViewerState';
import { useDocumentExplanation } from '@/hooks/useDocumentExplanation';
import { useDocumentCommentHandling } from '@/hooks/useDocumentCommentHandling';
import { DocumentViewerRef } from './DocumentViewer';
import { toast } from '@/components/ui/use-toast';

// Define props for the DocumentViewerContainer component
interface DocumentViewerContainerProps {
  documentVersionUrl: string;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
}

const DocumentViewerContainer = forwardRef<DocumentViewerRef, DocumentViewerContainerProps>((
  {
    documentVersionUrl,
    dealId,
    documentId,
    versionId,
    onCommentTriggered,
  },
  ref
) => {
  // Create a mutable ref that will store the methods exposed via useImperativeHandle
  const internalDocumentViewerRef = useRef<DocumentViewerRef | null>(null);
  
  // Use our custom hooks to manage state and functionality
  const {
    currentPage,
    showCommentSidebar,
    showExplanation,
    setShowExplanation,
    handleToggleCommentSidebar
  } = useDocumentViewerState({ documentVersionUrl });

  const {
    aiLoading,
    explanationResult,
    handleExplainSelectedText,
    handleCloseExplanation
  } = useDocumentExplanation({ dealId });

  const {
    comments,
    commentContent,
    setCommentContent,
    showCommentInput,
    submitting,
    activeCommentId,
    setActiveCommentId,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput,
    setShowCommentInput
  } = useDocumentCommentHandling({ versionId });

  const {
    selectedText,
    buttonPosition,
    locationData,
    documentContainerRef,
    handleMouseUp,
    clearSelection,
    setSelectedText,
    setButtonPosition,
  } = useDocumentSelection(currentPage);

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

  // Handle triggering AI explanation
  const handleExplainClick = () => {
    if (!selectedText || aiLoading) return;

    setButtonPosition(null);
    setShowExplanation(true);
    handleExplainSelectedText(selectedText);
  };

  // Handle opening comment input
  const handleCommentClick = () => {
    setButtonPosition(null);
    handleAddComment(selectedText, locationData, currentPage);

    if (onCommentTriggered && locationData) {
      onCommentTriggered({
        text: selectedText || '',
        pageNumber: locationData.pageNumber || currentPage,
        locationData: locationData
      });
    }
  };

  // Handle submitting a comment
  const handleCommentSubmit = async () => {
    // Fix: Call without parameters as per the function signature
    await handleSubmitComment();
  };

  // Handle comment sidebar item click
  const handleSidebarCommentClick = (commentId: string, commentLocationData: any) => {
    setActiveCommentId(commentId);
    highlightRef.current.highlightLocation(commentLocationData);
  };

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

  return (
    <div className="flex flex-col h-full space-y-4">
      <DocumentViewerHeader 
        commentsCount={comments.length} 
        onToggleCommentSidebar={handleToggleCommentSidebar} 
      />

      <div className="flex flex-1 gap-4">
        <DocumentViewerContent
          documentContainerRef={documentContainerRef}
          handleMouseUp={handleMouseUp}
          documentVersionUrl={documentVersionUrl}
          showCommentSidebar={showCommentSidebar}
          selectedText={selectedText}
          buttonPosition={buttonPosition}
          aiLoading={aiLoading}
          showCommentInput={showCommentInput}
          setShowCommentInput={setShowCommentInput}
          documentLoading={false}
          documentError={null}
          setDocumentLoading={() => {}}
          setDocumentError={() => {}}
          dealId={dealId}
          documentId={documentId}
          versionId={versionId}
          onCommentPosted={() => {}}
          onCommentCancel={() => {}}
          submitting={submitting}
          onExplainClick={handleExplainClick}
          onCommentClick={handleCommentClick}
          onCommentChange={setCommentContent}
          onCommentSubmit={handleCommentSubmit}
          onCommentClose={handleCloseCommentInput}
          commentContent={commentContent}
        />

        {showCommentSidebar && (
          <DocumentCommentsSidebar 
            versionId={versionId}
            documentId={documentId}
            dealId={dealId}
            documentViewerRef={internalDocumentViewerRef}
            onCommentClick={handleSidebarCommentClick}
            onSidebarToggle={handleToggleCommentSidebar}
          />
        )}
      </div>

      {showExplanation && (
        <DocumentAIExplanation
          loading={aiLoading}
          explanationResult={explanationResult}
          onClose={handleCloseExplanation}
        />
      )}
    </div>
  );
});

DocumentViewerContainer.displayName = 'DocumentViewerContainer';

export default DocumentViewerContainer;
