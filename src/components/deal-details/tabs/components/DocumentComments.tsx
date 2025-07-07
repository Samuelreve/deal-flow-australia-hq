import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    name?: string;
  };
}

interface DocumentCommentsProps {
  comments: Comment[];
  showCommentForm: boolean;
  isSubmittingComment: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedDocument: any;
  onToggleCommentForm: () => void;
  onAddComment: (content: string) => void;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({
  comments,
  showCommentForm,
  isSubmittingComment,
  selectedDocument,
  onToggleCommentForm,
  onAddComment,
}) => {
  const handleSubmitComment = () => {
    const textarea = document.getElementById('comment-input') as HTMLTextAreaElement;
    const content = textarea?.value.trim();
    if (content && !isSubmittingComment) {
      onAddComment(content);
      textarea.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = (e.target as HTMLTextAreaElement).value.trim();
      if (content && !isSubmittingComment) {
        onAddComment(content);
        (e.target as HTMLTextAreaElement).value = '';
      }
    }
  };

  return (
    <div className="w-80 border-l pl-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Comments</h4>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={onToggleCommentForm}
          disabled={!selectedDocument}
        >
          <MessageSquare className="h-4 w-4" />
          Add Comment
        </Button>
      </div>
      
      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-4 p-3 border rounded-lg bg-muted/20">
          <div className="space-y-3">
            <Textarea 
              placeholder="Add your comment..."
              className="min-h-[80px] resize-none"
              id="comment-input"
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-end gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={onToggleCommentForm}
                disabled={isSubmittingComment}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmitComment}
                disabled={isSubmittingComment}
              >
                <Send className="h-4 w-4 mr-1" />
                {isSubmittingComment ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground">
              {showCommentForm ? "Add a comment above" : "Click Add Comment to get started"}
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 border rounded-lg bg-background">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {comment.profiles?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.profiles?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentComments;