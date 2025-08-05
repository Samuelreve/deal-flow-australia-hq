import React from 'react';
import { Reply } from 'lucide-react';
import { DocumentComment } from '@/types/documentComment';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface DocumentCommentItemProps {
  comment: DocumentComment;
  onCommentClick: (commentId: string, locationData: any) => void;
  onToggleResolved: (commentId: string) => void;
  onReplyClick?: (commentId: string) => void;
  isActive?: boolean;
  isReply?: boolean;
}

const DocumentCommentItem: React.FC<DocumentCommentItemProps> = ({
  comment,
  onCommentClick,
  onToggleResolved,
  onReplyClick,
  isActive = false,
  isReply = false
}) => {
  // Generate consistent color theme for each user
  const getUserColorTheme = (userId: string) => {
    const colors = [
      { bg: 'bg-purple-50', border: 'border-purple-200', avatar: 'bg-purple-100', text: 'text-purple-600' },
      { bg: 'bg-green-50', border: 'border-green-200', avatar: 'bg-green-100', text: 'text-green-600' },
      { bg: 'bg-blue-50', border: 'border-blue-200', avatar: 'bg-blue-100', text: 'text-blue-600' },
      { bg: 'bg-orange-50', border: 'border-orange-200', avatar: 'bg-orange-100', text: 'text-orange-600' },
      { bg: 'bg-pink-50', border: 'border-pink-200', avatar: 'bg-pink-100', text: 'text-pink-600' },
      { bg: 'bg-indigo-50', border: 'border-indigo-200', avatar: 'bg-indigo-100', text: 'text-indigo-600' },
      { bg: 'bg-teal-50', border: 'border-teal-200', avatar: 'bg-teal-100', text: 'text-teal-600' },
      { bg: 'bg-amber-50', border: 'border-amber-200', avatar: 'bg-amber-100', text: 'text-amber-600' },
      { bg: 'bg-cyan-50', border: 'border-cyan-200', avatar: 'bg-cyan-100', text: 'text-cyan-600' },
      { bg: 'bg-rose-50', border: 'border-rose-200', avatar: 'bg-rose-100', text: 'text-rose-600' }
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
  const userName = comment.user?.name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReplyClick?.(comment.id);
  };

  // Format date like "8/3/2025"
  const formatShortDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className={`${isReply ? 'mb-2' : 'mb-3'}`}>
      <div 
        className={`${
          isReply 
            ? 'bg-green-50 border border-green-200 rounded-lg p-3' 
            : `${userTheme.bg} ${userTheme.border} border rounded-lg p-3`
        } hover:opacity-80 cursor-pointer transition-all ${
          isActive ? 'ring-2 ring-primary' : ''
        } ${
          comment.resolved ? 'opacity-75' : ''
        }`}
        onClick={() => onCommentClick(comment.id, comment.location_data)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-8 h-8 ${isReply ? 'bg-green-100 text-green-600' : `${userTheme.avatar} ${userTheme.text}`} rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
            {initials}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {userName}
              </span>
              {isReply && (
                <span className="text-xs text-muted-foreground">replied</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatShortDate(comment.created_at)}
              </span>
              {comment.resolved && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Resolved
                </span>
              )}
            </div>
            
            {/* Selected text quote - only for main comments */}
            {comment.location_data?.selectedText && !isReply && (
              <div className="mb-2 text-xs italic bg-background/50 p-2 rounded border-l-2 border-muted-foreground/30">
                "{comment.location_data.selectedText}"
              </div>
            )}
            
            {/* Comment content */}
            <div className={`text-sm mb-2 ${comment.resolved ? 'text-muted-foreground' : 'text-foreground'}`}>
              {comment.content}
            </div>
            
            {/* Page number - only for main comments */}
            {comment.page_number && !isReply && (
              <div className="text-xs text-muted-foreground mb-2">
                Page {comment.page_number}
              </div>
            )}

            {/* Reply button */}
            <div className="flex items-center justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReplyClick}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nested replies with connecting lines */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="relative ml-11 mt-2 space-y-2">
          {/* Vertical connecting line */}
          <div className="absolute left-[-20px] top-0 bottom-0 w-[2px] bg-blue-300 rounded-full"></div>
          
          {comment.replies.map((reply, index) => (
            <div key={reply.id} className="relative">
              {/* Horizontal connecting line */}
              <div className="absolute left-[-20px] top-4 w-[16px] h-[2px] bg-blue-300 rounded-full"></div>
              
              <DocumentCommentItem
                comment={reply}
                onCommentClick={onCommentClick}
                onToggleResolved={onToggleResolved}
                onReplyClick={onReplyClick}
                isActive={isActive}
                isReply={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentCommentItem;