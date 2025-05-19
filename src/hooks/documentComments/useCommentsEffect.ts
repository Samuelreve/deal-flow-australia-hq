
import { useEffect } from 'react';
import { DocumentComment } from '@/types/documentComment';

/**
 * Hook for managing comment highlighting and selection effects
 */
export function useCommentsEffect(
  activeCommentId: string | null,
  comments: DocumentComment[],
  documentViewerRef: React.RefObject<{ highlightLocation: (locationData: any) => void }>
) {
  // Effect to highlight active comment's location when it changes
  useEffect(() => {
    if (activeCommentId && comments.length > 0 && documentViewerRef.current) {
      const activeComment = comments.find(comment => comment.id === activeCommentId);
      if (activeComment?.location_data) {
        documentViewerRef.current.highlightLocation(activeComment.location_data);
      }
    }
  }, [activeCommentId, comments, documentViewerRef]);
}
