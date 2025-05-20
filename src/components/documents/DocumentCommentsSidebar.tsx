
import React, { useState, useEffect, ForwardedRef } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCommentForm from './DocumentCommentForm';
import DocumentCommentsList from './DocumentCommentsList';
import { Loader2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DocumentViewerRef } from './DocumentViewer';
import { useCommentsEffect } from '@/hooks/documentComments/useCommentsEffect';
import { useDocumentCommentSidebar } from '@/hooks/useDocumentCommentSidebar';

interface DocumentCommentsSidebarProps {
  versionId?: string;
  documentId?: string;
  dealId?: string;
  documentViewerRef: ForwardedRef<DocumentViewerRef>;
  onCommentClick?: (commentId: string, locationData: any) => void;
  onSidebarToggle?: (isOpen: boolean) => void;
}

const DocumentCommentsSidebar: React.FC<DocumentCommentsSidebarProps> = ({
  versionId,
  documentId,
  dealId,
  documentViewerRef,
  onCommentClick,
  onSidebarToggle
}) => {
  const { user } = useAuth();
  const { 
    comments, 
    loading: loadingComments, 
    fetchComments, 
    toggleResolved 
  } = useDocumentComments(versionId);
  
  // Error state for fetching
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Use our comment sidebar hook for managing sidebar state
  const {
    activeCommentId,
    setActiveCommentId,
    replyToCommentId,
    setReplyToCommentId,
    showCommentForm,
    setShowCommentForm,
    selectionDetails,
    setSelectionDetails,
    handleCommentClick: handleSidebarCommentClick,
    handleReplyClick,
    handleCancelInput
  } = useDocumentCommentSidebar(documentViewerRef);

  // Use our comments effect hook with updated handling for the ForwardedRef
  const handleRefForEffect = () => {
    if (typeof documentViewerRef === 'function') {
      return null; // Function refs can't be directly used in this context
    }
    return documentViewerRef;
  };
  
  useCommentsEffect(activeCommentId, comments, handleRefForEffect());

  // Fetch comments when versionId changes
  useEffect(() => {
    if (versionId) {
      setFetchError(null);
      fetchComments().catch(err => {
        console.error("Error fetching comments:", err);
        setFetchError("Failed to load comments. Please try again.");
      });
    }
  }, [versionId, fetchComments]);

  // Handle comment posted successfully
  const handleCommentPosted = () => {
    setShowCommentForm(false);
    setSelectionDetails(null);
    setReplyToCommentId(null);
    fetchComments();
    toast({
      title: "Comment posted",
      description: "Your comment has been added successfully"
    });
  };

  // Handle clicking on a comment to highlight in the viewer
  const handleCommentClickWrapper = (commentId: string, locationData: any) => {
    // Use our sidebar hook's handler
    handleSidebarCommentClick(commentId, locationData);
    
    // Call the passed onCommentClick if available
    if (onCommentClick) {
      onCommentClick(commentId, locationData);
    }
  };

  return (
    <div className="h-full border rounded-lg overflow-y-auto bg-background p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Document Comments ({comments.length})</h3>
        {onSidebarToggle && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSidebarToggle(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Loading state */}
      {loadingComments && comments.length === 0 && (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      )}
      
      {/* Error state */}
      {fetchError && (
        <div className="text-center py-4 text-destructive">
          <p>{fetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchComments()}
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {!loadingComments && !fetchError && comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
          <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground/60" />
          <p>No comments yet for this document.</p>
          <p className="text-sm">Select text in the document to add comments.</p>
        </div>
      )}
      
      {/* Comments list */}
      {comments.length > 0 && !fetchError && (
        <DocumentCommentsList 
          comments={comments}
          loading={loadingComments}
          onCommentClick={handleCommentClickWrapper}
          onToggleResolved={toggleResolved}
          onReplyClick={handleReplyClick}
          activeCommentId={activeCommentId}
        />
      )}
      
      {/* Comment Input Form */}
      {showCommentForm && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium mb-2">
            {replyToCommentId ? 'Reply to Comment' : 'Add Comment'}
          </h4>
          <DocumentCommentForm
            selectedText={selectionDetails?.selectedText}
            buttonPosition={null} // Not applicable in sidebar context
            pageNumber={selectionDetails?.pageNumber}
            locationData={selectionDetails?.locationData}
            parentCommentId={replyToCommentId}
            dealId={dealId}
            documentId={documentId}
            versionId={versionId}
            onCommentPosted={handleCommentPosted}
            onCancel={handleCancelInput}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentCommentsSidebar;
