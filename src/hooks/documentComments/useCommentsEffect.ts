
import { useEffect } from 'react';
import { DocumentComment } from '@/types/documentComment';
import { DocumentViewerRef } from '@/components/documents/DocumentViewer';

export const useCommentsEffect = (
  activeCommentId: string | null,
  comments: DocumentComment[],
  documentViewerRef: React.RefObject<DocumentViewerRef> | null
) => {
  // Effect to scroll to and highlight the selected comment's location
  useEffect(() => {
    // Only proceed if we have an active comment ID and a valid ref
    if (!activeCommentId || !documentViewerRef || !documentViewerRef.current) {
      return;
    }

    // Find the active comment in the comments array
    const activeComment = comments.find(comment => comment.id === activeCommentId);
    if (!activeComment) {
      return;
    }

    // If the comment has location data, highlight it
    if (activeComment.location_data) {
      documentViewerRef.current.highlightLocation(activeComment.location_data);
    }
  }, [activeCommentId, comments, documentViewerRef]);
};
