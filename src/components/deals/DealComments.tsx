
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useComments } from "./comments/useComments";
import CommentsList from "./comments/CommentsList";
import CommentForm from "./comments/CommentForm";

interface DealCommentsProps {
  dealId: string;
  userRole?: string;
  isParticipant?: boolean;
  currentUserDealRole?: 'seller' | 'buyer' | 'lawyer' | 'admin' | null;
}

const DealComments = ({ dealId, userRole = 'user', isParticipant = false, currentUserDealRole }: DealCommentsProps) => {
  const { isAuthenticated } = useAuth();
  
  const {
    comments,
    newComment,
    setNewComment,
    loading,
    submitting,
    error,
    handleSubmitComment,
    handleDeleteComment,
    currentUserId,
  } = useComments({ dealId });

  return (
    <div className="space-y-4">
      <CommentsList 
        comments={comments} 
        loading={loading} 
        currentUserId={currentUserId}
        currentUserDealRole={currentUserDealRole}
        onDelete={handleDeleteComment}
      />

      {isAuthenticated && isParticipant ? (
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleSubmitComment}
          submitting={submitting}
        />
      ) : (
        <p className="text-center text-muted-foreground text-sm pt-3 border-t">
          {isAuthenticated ? "You need to be a participant to comment" : "Please sign in to post comments"}
        </p>
      )}
    </div>
  );
};

export default DealComments;
