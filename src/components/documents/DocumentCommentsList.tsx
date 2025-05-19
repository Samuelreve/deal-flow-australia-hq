
import React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import DocumentCommentItem from './DocumentCommentItem';
import { DocumentComment as DbDocumentComment } from '@/types/documentComment';

interface DocumentCommentsListProps {
  comments: DbDocumentComment[];
  loading: boolean;
  onCommentClick: (commentId: string, locationData: any) => void;
  onToggleResolved: (commentId: string) => void;
  onReplyClick?: (commentId: string) => void;
  activeCommentId?: string | null;
}

const DocumentCommentsList: React.FC<DocumentCommentsListProps> = ({
  comments,
  loading,
  onCommentClick,
  onToggleResolved,
  onReplyClick,
  activeCommentId = null
}) => {
  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading comments...</span>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
        <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground/60" />
        <p>No comments yet for this document.</p>
      </div>
    );
  }

  // Filter to only show top-level comments (those without a parent_comment_id)
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);

  return (
    <div className="space-y-4">
      {topLevelComments.map((comment) => (
        <DocumentCommentItem 
          key={comment.id}
          comment={comment}
          onCommentClick={onCommentClick}
          onToggleResolved={onToggleResolved}
          onReplyClick={onReplyClick}
          isActive={comment.id === activeCommentId}
        />
      ))}
    </div>
  );
};

export default DocumentCommentsList;
