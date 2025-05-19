
import React, { useState } from 'react';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentCommentItemProps {
  comment: any;
  onCommentClick: (commentId: string, locationData: any) => void;
  onToggleResolved: (commentId: string) => void;
}

const DocumentCommentItem: React.FC<DocumentCommentItemProps> = ({
  comment,
  onCommentClick,
  onToggleResolved
}) => {
  const { user } = useAuth();
  
  const handleResolveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleResolved(comment.id);
  };
  
  return (
    <div 
      className={`border rounded-md p-3 ${comment.resolved ? 'bg-muted' : 'bg-card'} hover:bg-accent/80 cursor-pointer transition-colors`}
      onClick={() => onCommentClick(comment.id, comment.locationData)}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium">{comment.user?.name || 'User'}</div>
        <div className="flex items-center">
          {user && (
            <button
              className="p-1 text-muted-foreground hover:text-primary transition-colors mr-2"
              onClick={handleResolveToggle}
              title={comment.resolved ? "Mark as unresolved" : "Mark as resolved"}
            >
              <CheckCircle className={`h-4 w-4 ${comment.resolved ? 'text-green-500' : 'text-muted-foreground'}`} />
            </button>
          )}
          <div className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      
      {comment.locationData?.selectedText && (
        <div className="mt-1 text-xs italic bg-muted p-2 rounded">
          "{comment.locationData.selectedText}"
        </div>
      )}
      
      <div className={`mt-2 ${comment.resolved ? 'text-muted-foreground' : ''}`}>
        {comment.content}
      </div>
      
      {comment.pageNumber && (
        <div className="mt-1 text-xs text-muted-foreground">
          Page {comment.pageNumber}
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-3 border-l-2">
          <p className="text-xs text-muted-foreground mb-2">{comment.replies.length} replies</p>
          {comment.replies.map((reply: any) => (
            <div key={reply.id} className="mt-2 p-2 bg-muted/50 rounded-sm">
              <div className="flex justify-between items-start">
                <div className="text-xs font-medium">{reply.user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(reply.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-1 text-sm">{reply.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentCommentItem;
