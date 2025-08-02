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
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string;
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

// Recursive component for nested replies
interface NestedRepliesProps {
  replies: Comment[];
  level: number;
  getUserColorTheme: (userId: string) => any;
  user: any;
  setReplyingToId: (id: string | null) => void;
  replyingToId?: string | null;
  handleSubmitReply?: (commentId: string) => void;
  handleReplyKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>, commentId: string) => void;
  isSubmittingComment?: boolean;
}

const NestedReplies: React.FC<NestedRepliesProps> = ({ 
  replies, 
  level, 
  getUserColorTheme, 
  user, 
  setReplyingToId,
  replyingToId,
  handleSubmitReply,
  handleReplyKeyDown,
  isSubmittingComment
}) => {
  return (
    <div className="space-y-3 mt-3">
      {replies.map((reply, index) => {
        const replyTheme = getUserColorTheme(reply.user_id);
        return (
          <div key={reply.id} className="relative">
            <div className="ml-8">
              <div className={`relative p-3 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${replyTheme.bg} ${replyTheme.border} border-l-4 border-l-primary/50`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-8 h-8 ${replyTheme.avatar} rounded-full flex items-center justify-center shadow-sm border border-white`}>
                     <span className="text-sm font-semibold text-white">
                       {(reply.user?.name || reply.profiles?.name)?.charAt(0)?.toUpperCase() || 'U'}
                     </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-sm font-semibold text-foreground">
                         {reply.user?.name || reply.profiles?.name || 'Unknown User'}
                         {user?.id === reply.user_id && (
                          <span className="ml-1 text-xs text-primary font-medium">(me)</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">↳ replied</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
                
                {/* Reply button for nested replies */}
                {user?.id !== reply.user_id && (
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 flex items-center text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => setReplyingToId(reply.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Reply Form for This Comment */}
            {replyingToId === reply.id && handleSubmitReply && handleReplyKeyDown && (
              <div className="ml-6 mt-3 pl-6 border-l-4 border-primary animate-fade-in relative">
                {/* Strong visual connection to parent */}
                <div className="absolute -left-6 top-0 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-xl"></div>
                <div className="p-4 border rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
                  <div className="text-xs text-primary/70 mb-3 font-medium">
                    Replying to <span className="font-semibold text-primary">{reply.user?.name || reply.profiles?.name || 'Unknown User'}</span>
                  </div>
                  <div className="space-y-3">
                    <Textarea 
                      placeholder={`Reply to ${reply.user?.name || reply.profiles?.name || 'Unknown User'}...`}
                      className="min-h-[60px] resize-none text-sm border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg"
                      id={`reply-input-${reply.id}`}
                      onKeyDown={(e) => handleReplyKeyDown(e, reply.id)}
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
                        onClick={() => handleSubmitReply(reply.id)}
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

            {/* Nested Replies */}
            {reply.replies && reply.replies.length > 0 && (
              <div className="relative mt-4">
                <NestedReplies
                  replies={reply.replies} 
                  level={level + 1}
                  getUserColorTheme={getUserColorTheme}
                  user={user}
                  setReplyingToId={setReplyingToId}
                  replyingToId={replyingToId}
                  handleSubmitReply={handleSubmitReply}
                  handleReplyKeyDown={handleReplyKeyDown}
                  isSubmittingComment={isSubmittingComment}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

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

  // Comments now come pre-structured with nested replies from database function
  const groupedComments = React.useMemo(() => {
    // Debug log to see the structure
    console.log('📝 Comments from database function:', comments);
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        console.log(`💬 Comment ${comment.id} has ${comment.replies.length} replies:`, comment.replies);
      }
    });
    
    // Comments from the database function already have the proper nested structure
    // No need to filter as they already come as top-level comments with nested replies
    return comments;
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
          groupedComments.map((comment) => {
            const userTheme = getUserColorTheme(comment.user_id);
            return (
            <div key={comment.id} className="space-y-3 animate-fade-in">
              {/* Main Comment with enhanced styling */}
              <div className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${userTheme.bg} ${userTheme.border} border-l-4`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 ${userTheme.avatar} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
                    <span className="text-sm font-bold text-white">
                      {(comment.user?.name || comment.profiles?.name)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-semibold text-foreground">
                        {comment.user?.name || comment.profiles?.name || 'Unknown User'}
                        {user?.id === comment.user_id && (
                          <span className="ml-2 text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">(me)</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
                
                {/* Reply button - show only for other users' comments */}
                {user?.id !== comment.user_id && (
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 flex items-center text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => setReplyingToId(comment.id)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                )}
              </div>

              {/* Replies Section - Use NestedReplies component for proper recursive handling */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                  <NestedReplies
                    replies={comment.replies} 
                    level={0}
                    getUserColorTheme={getUserColorTheme}
                    user={user}
                    setReplyingToId={setReplyingToId}
                    replyingToId={replyingToId}
                    handleSubmitReply={handleSubmitReply}
                    handleReplyKeyDown={handleReplyKeyDown}
                    isSubmittingComment={isSubmittingComment}
                  />
                </div>
              )}

              {/* Enhanced Reply Form for Root Comment */}
              {replyingToId === comment.id && (
                <div className="ml-8 pl-6 border-l-4 border-primary animate-fade-in relative">
                  {/* Strong visual connection to parent comment */}
                  <div className="absolute -left-6 top-0 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-xl"></div>
                  <div className="p-4 border rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
                    <div className="text-xs text-primary/70 mb-3 font-medium">
                      Replying to <span className="font-semibold text-primary">{comment.user?.name || comment.profiles?.name || 'Unknown User'}</span>
                    </div>
                    <div className="space-y-3">
                      <Textarea 
                        placeholder={`Reply to ${comment.user?.name || comment.profiles?.name || 'Unknown User'}...`}
                        className="min-h-[60px] resize-none text-sm border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg"
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default DocumentComments;