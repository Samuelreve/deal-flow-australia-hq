
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Check, X, Trash2, Edit, CornerDownRight, CheckSquare } from "lucide-react";
import { DocumentComment } from "@/services/documentCommentService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DocumentCommentForm from "./DocumentCommentForm";

interface DocumentCommentItemProps {
  comment: DocumentComment;
  currentUserId?: string;
  isReply?: boolean;
  onReplyToComment?: (commentId: string, content: string) => Promise<any>;
  onDelete?: (commentId: string, parentId?: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onToggleResolved?: (commentId: string) => void;
  currentUserDealRole?: string;
  submitting?: boolean;
}

const DocumentCommentItem = ({
  comment,
  currentUserId,
  isReply = false,
  onReplyToComment,
  onDelete,
  onEdit,
  onToggleResolved,
  currentUserDealRole,
  submitting = false
}: DocumentCommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);

  // Debug logging
  console.log('DocumentCommentItem props:', {
    commentId: comment.id,
    isReply,
    hasOnReplyToComment: !!onReplyToComment,
    content: comment.content
  });
  
  const canEdit = currentUserId === comment.userId;
  const canDelete = currentUserId === comment.userId || 
    ['admin', 'seller'].includes(currentUserDealRole || '');
  
  const userInitials = comment.user?.name
    ? comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';
  
  const handleSaveEdit = () => {
    if (editedContent.trim() && onEdit) {
      onEdit(comment.id, editedContent);
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const handleReplySubmit = async (content: string) => {
    if (onReplyToComment) {
      await onReplyToComment(comment.id, content);
      setIsReplying(false);
    }
  };

  const handleCancelReply = () => {
    setIsReplying(false);
  };

  return (
    <div className={`relative flex gap-3 ${comment.resolved ? 'opacity-70' : ''}`}>
      <div className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.avatarUrl} alt={comment.user?.name || 'User'} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.user?.name || 'Unknown User'}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </span>
          {comment.resolved && (
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs px-1.5 py-0.5">
              <CheckSquare className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm">{comment.content}</div>
        )}
        
        {!isEditing && (
          <div className="flex gap-3 pt-1">
            {onReplyToComment ? (
              <button 
                onClick={() => setIsReplying(true)} 
                className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <CornerDownRight className="h-3 w-3 mr-1" />
                Reply
              </button>
            ) : null}
            
            {canEdit && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </button>
            )}
            
            {canDelete && onDelete && (
              <button 
                onClick={() => onDelete(comment.id, isReply ? comment.parentCommentId : undefined)} 
                className="text-xs flex items-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </button>
            )}
            
            {onToggleResolved && !isReply && (
              <button 
                onClick={() => onToggleResolved(comment.id)} 
                className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                {comment.resolved ? (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Reopen
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Resolve
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Reply form */}
        {isReplying && (
          <div className="mt-3">
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
        
        {/* Render replies if any */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l border-gray-100">
            {comment.replies.map(reply => (
              <DocumentCommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                isReply={true}
                onReplyToComment={onReplyToComment}
                onDelete={onDelete}
                onEdit={onEdit}
                currentUserDealRole={currentUserDealRole}
                submitting={submitting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCommentItem;
