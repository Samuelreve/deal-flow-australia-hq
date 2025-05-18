
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "./types";
import { formatDate } from "./commentUtils";

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, canDelete }) => {
  return (
    <div className="flex gap-3 pb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.name || 'User')}&background=0D8ABC&color=fff`} 
          alt={comment.profiles?.name || 'User'} 
        />
        <AvatarFallback>{(comment.profiles?.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {comment.profiles?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
        </div>
        <p className="mt-1 text-sm">{comment.content}</p>
        
        {canDelete && (
          <div className="mt-1 text-xs text-muted-foreground">
            <button 
              onClick={() => onDelete(comment.id)}
              className="hover:underline text-destructive"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
