
import React from 'react';
import { CheckCircle, MessageSquare, Reply } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentComment } from '@/types/documentComment';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface DocumentCommentItemProps {
  comment: DocumentComment;
  onCommentClick: (commentId: string, locationData: any) => void;
  onToggleResolved: (commentId: string) => void;
  onReplyClick?: (commentId: string) => void;
  isActive?: boolean;
}

const DocumentCommentItem: React.FC<DocumentCommentItemProps> = ({
  comment,
  onCommentClick,
  onToggleResolved,
  onReplyClick,
  isActive = false
}) => {
  const { user } = useAuth();

  // Generate consistent color theme for each user
  const getUserColorTheme = (userId: string) => {
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-200', avatar: 'bg-blue-100' },
      { bg: 'bg-green-50', border: 'border-green-200', avatar: 'bg-green-100' },
      { bg: 'bg-purple-50', border: 'border-purple-200', avatar: 'bg-purple-100' },
      { bg: 'bg-orange-50', border: 'border-orange-200', avatar: 'bg-orange-100' },
      { bg: 'bg-pink-50', border: 'border-pink-200', avatar: 'bg-pink-100' },
      { bg: 'bg-indigo-50', border: 'border-indigo-200', avatar: 'bg-indigo-100' },
      { bg: 'bg-teal-50', border: 'border-teal-200', avatar: 'bg-teal-100' },
      { bg: 'bg-amber-50', border: 'border-amber-200', avatar: 'bg-amber-100' },
      { bg: 'bg-cyan-50', border: 'border-cyan-200', avatar: 'bg-cyan-100' },
      { bg: 'bg-rose-50', border: 'border-rose-200', avatar: 'bg-rose-100' }
    ];
    
    // Use simple hash to consistently assign colors
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const userTheme = getUserColorTheme(comment.user_id);
  
  const handleResolveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleResolved(comment.id);
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReplyClick?.(comment.id);
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
      className={`border rounded-md p-3 mb-2 ${userTheme.bg} ${userTheme.border} ${
        isActive ? 'ring-2 ring-primary' : ''
      } ${
        comment.resolved ? 'opacity-75' : ''
      } hover:bg-accent/80 cursor-pointer transition-colors`}
      onClick={() => onCommentClick(comment.id, comment.location_data)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <span className="font-medium">
            {comment.user?.name || 'User'}
            {user?.id === comment.user_id && (
              <span className="ml-1 text-xs text-muted-foreground">(me)</span>
            )}
          </span>
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

      {/* Reply button - show to all users */}
      <div className="mt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReplyClick}
          className="h-8 flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <Reply className="h-3 w-3 mr-1" />
          Reply
        </Button>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-3 border-l-2">
          <CommentReplies 
            replies={comment.replies} 
            isActive={isActive}
            onReplyClick={onReplyClick}
            onCommentClick={onCommentClick}
            onToggleResolved={onToggleResolved}
          />
        </div>
      )}
    </div>
  );
};

// Helper component for rendering replies
const CommentReplies = ({ 
  replies,
  isActive,
  onReplyClick,
  onCommentClick,
  onToggleResolved
}: { 
  replies: DocumentComment[];
  isActive?: boolean;
  onReplyClick?: (commentId: string) => void;
  onCommentClick: (commentId: string, locationData: any) => void;
  onToggleResolved: (commentId: string) => void;
}) => {
  return (
    <>
      <p className="text-xs text-muted-foreground mb-2 flex items-center">
        <MessageSquare className="h-3 w-3 mr-1" />
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </p>
      {replies.map((reply) => (
        <DocumentCommentItem
          key={reply.id}
          comment={reply}
          onCommentClick={onCommentClick}
          onToggleResolved={onToggleResolved}
          onReplyClick={onReplyClick}
          isActive={isActive}
        />
      ))}
    </>
  );
};

export default DocumentCommentItem;
