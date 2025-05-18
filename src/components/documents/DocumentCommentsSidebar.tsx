
import React from 'react';
import { DocumentComment } from '@/services/documentComment';
import { Loader2 } from 'lucide-react';

interface DocumentCommentsSidebarProps {
  comments: DocumentComment[];
  loading: boolean;
  onCommentClick?: (commentId: string, locationData: any) => void;
}

const DocumentCommentsSidebar: React.FC<DocumentCommentsSidebarProps> = ({ 
  comments, 
  loading,
  onCommentClick 
}) => {
  return (
    <div className="h-full w-1/3 border rounded-lg overflow-y-auto bg-background p-4">
      <h3 className="font-medium mb-4">Comments</h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className="border rounded-md p-3 bg-card hover:bg-accent/80 cursor-pointer transition-colors"
              onClick={() => onCommentClick?.(comment.id, comment.locationData)}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{comment.user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
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
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-3 border-l-2">
                  <p className="text-xs text-muted-foreground mb-2">{comment.replies.length} replies</p>
                </div>
              )}
            </div>
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

export default DocumentCommentsSidebar;
