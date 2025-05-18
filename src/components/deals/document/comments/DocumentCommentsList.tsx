
import { useState } from "react";
import { DocumentComment } from "@/services/documentCommentService";
import DocumentCommentItem from "./DocumentCommentItem";
import DocumentCommentForm from "./DocumentCommentForm";
import { MessageSquare, Loader2 } from "lucide-react";

interface DocumentCommentsListProps {
  comments: DocumentComment[];
  loading: boolean;
  submitting: boolean;
  currentUserId?: string;
  currentUserDealRole?: string;
  onAddComment: (content: string) => Promise<any>;
  onReplyToComment: (commentId: string, content: string) => Promise<any>;
  onEditComment: (commentId: string, content: string) => Promise<any>;
  onDeleteComment: (commentId: string, parentId?: string) => Promise<any>;
  onToggleResolved: (commentId: string) => Promise<any>;
}

const DocumentCommentsList = ({
  comments,
  loading,
  submitting,
  currentUserId,
  currentUserDealRole,
  onAddComment,
  onReplyToComment,
  onEditComment,
  onDeleteComment,
  onToggleResolved
}: DocumentCommentsListProps) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  
  const handleReplyClick = (commentId: string) => {
    setReplyingToId(commentId);
  };
  
  const handleReplySubmit = async (content: string) => {
    if (replyingToId) {
      await onReplyToComment(replyingToId, content);
      setReplyingToId(null);
    }
  };
  
  const handleCancelReply = () => {
    setReplyingToId(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        Comments
      </h3>
      
      <div className="space-y-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id}>
                <DocumentCommentItem
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReplyClick}
                  onDelete={onDeleteComment}
                  onEdit={onEditComment}
                  onToggleResolved={onToggleResolved}
                  currentUserDealRole={currentUserDealRole}
                />
                
                {replyingToId === comment.id && (
                  <div className="mt-3 pl-8">
                    <DocumentCommentForm
                      onSubmit={handleReplySubmit}
                      isSubmitting={submitting}
                      placeholder="Write a reply..."
                      buttonText="Reply"
                      autoFocus
                      onCancel={handleCancelReply}
                      showCancel
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        <DocumentCommentForm
          onSubmit={onAddComment}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
};

export default DocumentCommentsList;
