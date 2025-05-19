
import React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import DocumentCommentItem from './DocumentCommentItem';
import { DocumentComment } from '@/types/documentComment';

interface DocumentCommentsListProps {
  comments: DocumentComment[];
  loading: boolean;
  onCommentClick: (commentId: string, locationData: any) => void;
  onToggleResolved: (commentId: string) => void;
}

const DocumentCommentsList: React.FC<DocumentCommentsListProps> = ({
  comments,
  loading,
  onCommentClick,
  onToggleResolved
}) => {
  if (loading) {
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

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <DocumentCommentItem 
          key={comment.id}
          comment={comment}
          onCommentClick={onCommentClick}
          onToggleResolved={onToggleResolved}
        />
      ))}
    </div>
  );
};

export default DocumentCommentsList;
