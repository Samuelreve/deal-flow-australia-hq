
import { useDocumentComments } from "@/hooks/useDocumentComments";
import { useAuth } from "@/contexts/AuthContext";
import DocumentCommentsList from "./DocumentCommentsList";

interface DocumentCommentsPanelProps {
  documentVersionId?: string;
  currentUserDealRole?: string;
  isParticipant?: boolean;
}

const DocumentCommentsPanel = ({
  documentVersionId,
  currentUserDealRole,
  isParticipant = false
}: DocumentCommentsPanelProps) => {
  const { user } = useAuth();
  const {
    comments,
    loading,
    submitting,
    addComment,
    editComment,
    deleteComment,
    toggleResolved
  } = useDocumentComments(documentVersionId);
  
  // Handle adding a new top-level comment
  const handleAddComment = async (content: string) => {
    if (documentVersionId) {
      await addComment({ content });
    }
  };
  
  // Handle replying to a comment
  const handleReplyToComment = async (commentId: string, content: string) => {
    if (documentVersionId) {
      await addComment({ content, parentCommentId: commentId });
    }
  };
  
  if (!documentVersionId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Select a document to view and add comments
      </div>
    );
  }
  
  if (!isParticipant) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You need to be a participant in this deal to view document comments
      </div>
    );
  }

  return (
    <div className="p-4">
      <DocumentCommentsList
        comments={comments}
        loading={loading}
        submitting={submitting}
        currentUserId={user?.id}
        currentUserDealRole={currentUserDealRole}
        onAddComment={handleAddComment}
        onReplyToComment={handleReplyToComment}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
        onToggleResolved={toggleResolved}
      />
    </div>
  );
};

export default DocumentCommentsPanel;
