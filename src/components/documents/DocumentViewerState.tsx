
import React from 'react';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';
import { useDocumentInteractions } from '@/hooks/useDocumentInteractions';

interface DocumentViewerStateProps {
  currentPage: number;
  versionId?: string;
  dealId: string;
  onCommentTriggered?: (selection: { text: string; pageNumber?: number; locationData: any }) => void;
  onTextSelected?: (text: string | null) => void;
  children: (state: any) => React.ReactNode;
}

const DocumentViewerState: React.FC<DocumentViewerStateProps> = ({
  currentPage,
  versionId,
  dealId,
  onCommentTriggered,
  onTextSelected,
  children
}) => {
  // Use selection hook to track text selection
  const selectionState = useDocumentSelection(currentPage);
  
  // Use document interactions hook for UI state and actions
  const interactionState = useDocumentInteractions({
    versionId,
    dealId,
    selectedText: selectionState.selectedText,
    locationData: selectionState.locationData,
    currentPage,
    onCommentTriggered
  });

  // Notify parent when text is selected
  React.useEffect(() => {
    if (onTextSelected) {
      onTextSelected(selectionState.selectedText);
    }
  }, [selectionState.selectedText, onTextSelected]);

  return (
    <>
      {children({
        ...selectionState,
        ...interactionState
      })}
    </>
  );
};

export default DocumentViewerState;
