
import React from "react";
import { MessageSquare } from "lucide-react";
import CommentItem from "./CommentItem";
import { Comment } from "./types";

interface CommentsListProps {
  comments: Comment[];
  loading: boolean;
  currentUserId: string;
  currentUserDealRole?: string;
  onDelete: (id: string) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({ 
  comments, 
  loading, 
  currentUserId, 
  currentUserDealRole,
  onDelete
}) => {
  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
      {comments.map((comment) => {
        const isAuthor = comment.user_id === currentUserId;
        const canManageComments = currentUserDealRole === 'admin' || currentUserDealRole === 'lawyer';
        const canDelete = isAuthor || canManageComments;
        
        return (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onDelete={onDelete} 
            canDelete={canDelete} 
          />
        );
      })}
    </div>
  );
};

export default CommentsList;
