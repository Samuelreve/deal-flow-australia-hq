
import React from 'react';
import { Loader2 } from 'lucide-react';
import DocumentCommentItem from './DocumentCommentItem';

interface DocumentCommentsListProps {
  comments: any[];
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
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
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
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet for this document.
        </div>
      )}
    </div>
  );
};

export default DocumentCommentsList;
