import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Reply } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id?: string | null;
  profiles?: {
    name?: string;
  };
  replies?: Comment[];
}

interface DocumentCommentsProps {
  comments: Comment[];
  showCommentForm: boolean;
  isSubmittingComment: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedDocument: any;
  onToggleCommentForm: () => void;
  onAddComment: (content: string, parentCommentId?: string) => void;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({
  comments,
  showCommentForm,
  isSubmittingComment,
  selectedDocument,
  onToggleCommentForm,
  onAddComment,
}) => {
  const { user } = useAuth();
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const handleSubmitComment = () => {
    const textarea = document.getElementById('comment-input') as HTMLTextAreaElement;
    const content = textarea?.value.trim();
    if (content && !isSubmittingComment) {
      onAddComment(content);
      textarea.value = '';
    }
  };

  const handleSubmitReply = (commentId: string) => {
    const textarea = document.getElementById(`reply-input-${commentId}`) as HTMLTextAreaElement;
    const content = textarea?.value.trim();
    if (content && !isSubmittingComment) {
      onAddComment(content, commentId);
      textarea.value = '';
      setReplyingToId(null);
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

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, commentId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = (e.target as HTMLTextAreaElement).value.trim();
      if (content && !isSubmittingComment) {
        onAddComment(content, commentId);
        (e.target as HTMLTextAreaElement).value = '';
        setReplyingToId(null);
      }
    }
  };

  // Group comments by parent-child relationship
  const groupedComments = React.useMemo(() => {
    const topLevelComments = comments.filter(comment => !comment.parent_comment_id);
    return topLevelComments.map(comment => ({
      ...comment,
      replies: comments.filter(reply => reply.parent_comment_id === comment.id)
    }));
  }, [comments]);

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
          groupedComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Main Comment */}
              <div className="p-3 border rounded-lg bg-background">
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
                        {user?.id === comment.user_id && (
                          <span className="ml-1 text-xs text-muted-foreground">(me)</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
                
                {/* Reply button - show only for other users' comments */}
                {user?.id !== comment.user_id && (
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 flex items-center text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setReplyingToId(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                )}
              </div>

              {/* Replies Section */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 pl-4 border-l-2 border-muted space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-3 border rounded-lg bg-muted/30 animate-fade-in">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {reply.profiles?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {reply.profiles?.name || 'Unknown User'}
                              {user?.id === reply.user_id && (
                                <span className="ml-1 text-xs text-muted-foreground">(me)</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">replied</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="pl-8">
                        <div className="text-xs text-muted-foreground mb-1">
                          Replying to <span className="font-medium">{comment.profiles?.name || 'Unknown User'}</span>
                        </div>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingToId === comment.id && (
                <div className="ml-6 pl-4 border-l-2 border-primary animate-fade-in">
                  <div className="p-3 border rounded-lg bg-primary/5">
                    <div className="text-xs text-muted-foreground mb-2">
                      Replying to <span className="font-medium">{comment.profiles?.name || 'Unknown User'}</span>
                    </div>
                    <div className="space-y-3">
                      <Textarea 
                        placeholder={`Reply to ${comment.profiles?.name || 'Unknown User'}...`}
                        className="min-h-[60px] resize-none text-sm border-primary/20 focus:border-primary"
                        id={`reply-input-${comment.id}`}
                        onKeyDown={(e) => handleReplyKeyDown(e, comment.id)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setReplyingToId(null)}
                          disabled={isSubmittingComment}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={isSubmittingComment}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {isSubmittingComment ? 'Replying...' : 'Reply'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentComments;