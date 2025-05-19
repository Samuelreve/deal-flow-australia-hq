
import React from 'react';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentComment } from '@/types/documentComment';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCommentItemProps {
  comment: DocumentComment;
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

  // Format the timestamp as a relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  return (
    <div 
      className={`border rounded-md p-3 ${comment.resolved ? 'bg-muted' : 'bg-card'} hover:bg-accent/80 cursor-pointer transition-colors`}
      onClick={() => onCommentClick(comment.id, comment.location_data)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <span className="font-medium">{comment.user?.name || 'User'}</span>
          {comment.resolved && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Resolved
            </span>
          )}
        </div>
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
            {getRelativeTime(comment.created_at)}
          </div>
        </div>
      </div>
      
      {comment.location_data?.selectedText && (
        <div className="mt-1 text-xs italic bg-muted p-2 rounded">
          "{comment.location_data.selectedText}"
        </div>
      )}
      
      <div className={`mt-2 ${comment.resolved ? 'text-muted-foreground' : ''}`}>
        {comment.content}
      </div>
      
      {comment.page_number && (
        <div className="mt-1 text-xs text-muted-foreground">
          Page {comment.page_number}
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-3 border-l-2">
          <CommentReplies replies={comment.replies} />
        </div>
      )}
    </div>
  );
};

// Helper component for rendering replies
const CommentReplies = ({ replies }: { replies: DocumentComment[] }) => {
  return (
    <>
      <p className="text-xs text-muted-foreground mb-2 flex items-center">
        <MessageSquare className="h-3 w-3 mr-1" />
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </p>
      {replies.map((reply) => (
        <div key={reply.id} className="mt-2 p-2 bg-muted/50 rounded-sm">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium">{reply.user?.name || 'User'}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
            </div>
          </div>
          <div className="mt-1 text-sm">{reply.content}</div>
        </div>
      ))}
    </>
  );
};

export default DocumentCommentItem;
