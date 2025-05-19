
import React, { useEffect, useState } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCommentForm from './DocumentCommentForm';
import { toast } from '@/components/ui/use-toast';

interface DocumentCommentsSidebarProps {
  versionId?: string;
  documentId?: string;
  dealId?: string;
  documentViewerRef?: React.RefObject<any>;
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
  const { comments, loading, addComment, fetchComments, toggleResolved } = useDocumentComments(versionId);
  const { user } = useAuth();
  
  // State for managing the comment form
  const [showInputForm, setShowInputForm] = useState(false);
  const [selectionDetails, setSelectionDetails] = useState<{
    selectedText: string | null;
    pageNumber?: number;
    locationData: any;
  } | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments when versionId changes
  useEffect(() => {
    if (versionId) {
      fetchComments();
    }
  }, [versionId, fetchComments]);

  // Handle comment triggered from viewer
  const handleCommentTriggeredFromViewer = (details: {
    text: string;
    pageNumber?: number;
    locationData: any;
  }) => {
    setSelectionDetails({
      selectedText: details.text,
      pageNumber: details.pageNumber,
      locationData: details.locationData
    });
    setShowInputForm(true);
    setCommentContent('');
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!versionId || !user || !commentContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment and ensure you are logged in.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addComment({
        content: commentContent,
        pageNumber: selectionDetails?.pageNumber,
        locationData: selectionDetails?.locationData
      });
      
      setCommentContent('');
      setShowInputForm(false);
      setSelectionDetails(null);
      
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
      
      // Refresh comments list
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment cancellation
  const handleCancelInput = () => {
    setShowInputForm(false);
    setSelectionDetails(null);
    setCommentContent('');
  };

  // Handle comment resolution toggle
  const handleToggleResolved = async (commentId: string) => {
    await toggleResolved(commentId);
    // Refresh comments after toggling resolved status
    fetchComments();
  };

  // Handle clicking on a comment to highlight in the viewer
  const handleCommentClick = (commentId: string, locationData: any) => {
    // If we have a documentViewerRef and it has a highlightLocation method
    if (documentViewerRef?.current?.highlightLocation && locationData) {
      documentViewerRef.current.highlightLocation(locationData);
    }
    
    // Call the passed onCommentClick if available
    if (onCommentClick) {
      onCommentClick(commentId, locationData);
    }
  };

  return (
    <div className="h-full border rounded-lg overflow-y-auto bg-background p-4 w-1/3">
      <h3 className="font-medium mb-4">Document Comments</h3>
      
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
              className={`border rounded-md p-3 ${comment.resolved ? 'bg-muted' : 'bg-card'} hover:bg-accent/80 cursor-pointer transition-colors`}
              onClick={() => handleCommentClick(comment.id, comment.locationData)}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{comment.user?.name || 'User'}</div>
                <div className="flex items-center">
                  {user && (
                    <button
                      className="p-1 text-muted-foreground hover:text-primary transition-colors mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleResolved(comment.id);
                      }}
                      title={comment.resolved ? "Mark as unresolved" : "Mark as resolved"}
                    >
                      <CheckCircle className={`h-4 w-4 ${comment.resolved ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </button>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {comment.locationData?.selectedText && (
                <div className="mt-1 text-xs italic bg-muted p-2 rounded">
                  "{comment.locationData.selectedText}"
                </div>
              )}
              
              <div className={`mt-2 ${comment.resolved ? 'text-muted-foreground' : ''}`}>
                {comment.content}
              </div>
              
              {comment.pageNumber && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Page {comment.pageNumber}
                </div>
              )}
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-3 border-l-2">
                  <p className="text-xs text-muted-foreground mb-2">{comment.replies.length} replies</p>
                  {/* We could expand this to show replies or add a "Show Replies" button */}
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="mt-2 p-2 bg-muted/50 rounded-sm">
                      <div className="flex justify-between items-start">
                        <div className="text-xs font-medium">{reply.user?.name || 'User'}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-1 text-sm">{reply.content}</div>
                    </div>
                  ))}
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
      
      {/* Comment Input Form */}
      {showInputForm && (
        <div className="mt-4 border-t pt-4">
          <DocumentCommentForm
            selectedText={selectionDetails?.selectedText}
            buttonPosition={null} // Not applicable in sidebar context
            commentContent={commentContent}
            onCommentChange={setCommentContent}
            submitting={submitting}
            onSubmit={handleCommentSubmit}
            onClose={handleCancelInput}
            pageNumber={selectionDetails?.pageNumber}
            locationData={selectionDetails?.locationData}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentCommentsSidebar;
