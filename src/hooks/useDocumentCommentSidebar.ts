
import { useState, ForwardedRef } from 'react';
import { DocumentComment } from '@/types/documentComment';
import { DocumentViewerRef } from '@/components/documents/DocumentViewer';

export function useDocumentCommentSidebar(
  documentViewerRef: ForwardedRef<DocumentViewerRef>
) {
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectionDetails, setSelectionDetails] = useState<{
    selectedText: string | null;
    pageNumber?: number;
    locationData: any;
  } | null>(null);

  // Handle comment sidebar item click
  const handleCommentClick = (commentId: string, commentLocationData: any) => {
    setActiveCommentId(commentId === activeCommentId ? null : commentId);
    
    // We need to check if documentViewerRef is a ref object or a function
    if (typeof documentViewerRef === 'function') {
      console.warn('Function ref cannot be used directly for highlighting');
    } else if (documentViewerRef && documentViewerRef.current && commentLocationData) {
      documentViewerRef.current.highlightLocation(commentLocationData);
    }
  };

  // Handle replying to a comment
  const handleReplyClick = (commentId: string) => {
    setReplyToCommentId(commentId);
    setShowCommentForm(true);
  };

  // Handle cancelling comment input
  const handleCancelInput = () => {
    setShowCommentForm(false);
    setReplyToCommentId(null);
    setSelectionDetails(null);
  };

  // Handle comment triggered from viewer
  const handleCommentTriggeredFromViewer = (details: {
    text: string;
    pageNumber?: number;
    locationData: any;
  }) => {
    setSelectionDetails({
      selectedText: details.text,
      pageNumber: details.pageNumber,
      locationData: details.locationData
    });
    setReplyToCommentId(null);
    setShowCommentForm(true);
  };

  return {
    activeCommentId,
    setActiveCommentId,
    replyToCommentId,
    setReplyToCommentId,
    showCommentForm,
    setShowCommentForm,
    selectionDetails,
    setSelectionDetails,
    handleCommentClick,
    handleReplyClick,
    handleCancelInput,
    handleCommentTriggeredFromViewer
  };
}
