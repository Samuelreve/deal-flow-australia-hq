
import React from 'react';
import { Loader2 } from 'lucide-react';
import { DocumentComment } from '@/services/documentComment';

interface DocumentCommentsSidebarProps {
  comments: DocumentComment[];
  loading: boolean;
}

const DocumentCommentsSidebar: React.FC<DocumentCommentsSidebarProps> = ({
  comments,
  loading,
}) => {
  return (
    <div className="w-1/3 border rounded-lg overflow-y-auto bg-background p-4">
      <h3 className="font-medium mb-4">Document Comments</h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-3 bg-card">
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
