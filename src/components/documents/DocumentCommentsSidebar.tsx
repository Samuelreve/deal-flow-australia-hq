
import React, { useState } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentComment } from '@/services/documentComment';
import { format } from 'date-fns';

interface DocumentCommentsSidebarProps {
  versionId?: string;
  onCommentClick?: (commentId: string, locationData: any) => void;
}

const DocumentCommentsSidebar: React.FC<DocumentCommentsSidebarProps> = ({
  versionId,
  onCommentClick
}) => {
  const { comments, loading } = useDocumentComments(versionId);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderComment = (comment: DocumentComment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`border rounded-md p-3 ${isReply ? 'bg-muted/50' : 'bg-card'} hover:bg-accent/80 cursor-pointer transition-colors ${comment.resolved ? 'border-green-500/30' : ''}`}
      onClick={() => onCommentClick?.(comment.id, comment.locationData)}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium">{comment.user?.name || 'User'}</div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
        </div>
      </div>
      
      {comment.locationData?.selectedText && (
        <div className="mt-1 text-xs italic bg-muted p-2 rounded">
          "{comment.locationData.selectedText}"
        </div>
      )}
      
      <div className="mt-2">{comment.content}</div>
      
      {comment.pageNumber && (
        <div className="mt-1 text-xs text-muted-foreground">
          Page {comment.pageNumber}
        </div>
      )}

      {comment.resolved && (
        <div className="mt-2 flex items-center text-xs text-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Resolved</span>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs p-1 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              toggleReplies(comment.id);
            }}
          >
            {expandedReplies[comment.id] ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>
          
          {expandedReplies[comment.id] && (
            <div className="mt-2 pl-3 border-l-2 space-y-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="h-full border rounded-lg overflow-y-auto bg-background p-4">
      <h3 className="font-medium mb-4">Document Comments</h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet for this document.
        </div>
      )}
    </div>
  );
};

export default DocumentCommentsSidebar;
