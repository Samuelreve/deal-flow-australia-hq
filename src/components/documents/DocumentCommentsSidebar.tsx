
import React, { useState } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCommentForm from './DocumentCommentForm';
import DocumentCommentsList from './DocumentCommentsList';
import { Loader2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DocumentViewerRef } from './DocumentViewer';
import { useCommentsEffect } from '@/hooks/documentComments/useCommentsEffect';

interface DocumentCommentsSidebarProps {
  versionId?: string;
  documentId?: string;
  dealId?: string;
  documentViewerRef: React.RefObject<DocumentViewerRef>;
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
  const { comments, loading, fetchComments, toggleResolved } = useDocumentComments(versionId);
  
  // State for managing the comment form and selections
  const [showInputForm, setShowInputForm] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [selectionDetails, setSelectionDetails] = useState<{
    selectedText: string | null;
    pageNumber?: number;
    locationData: any;
  } | null>(null);

  // Use our comments effect hook
  useCommentsEffect(activeCommentId, comments, documentViewerRef);

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
    setReplyToCommentId(null);
    setShowInputForm(true);
  };

  // Handle comment cancellation
  const handleCancelInput = () => {
    setShowInputForm(false);
    setSelectionDetails(null);
    setReplyToCommentId(null);
  };

  // Handle comment posted successfully
  const handleCommentPosted = () => {
    setShowInputForm(false);
    setSelectionDetails(null);
    setReplyToCommentId(null);
    toast({
      title: "Comment posted",
      description: "Your comment has been added successfully"
    });
  };

  // Handle clicking on a comment to highlight in the viewer
  const handleCommentClick = (commentId: string, locationData: any) => {
    // Set active comment
    setActiveCommentId(commentId === activeCommentId ? null : commentId);
    
    // If we have a documentViewerRef and it has a highlightLocation method
    if (documentViewerRef?.current?.highlightLocation && locationData) {
      documentViewerRef.current.highlightLocation(locationData);
      console.log(`Highlighting comment ${commentId} with location data:`, locationData);
    } else {
      console.warn('Cannot highlight location: Viewer ref not available or location data missing');
    }
    
    // Call the passed onCommentClick if available
    if (onCommentClick) {
      onCommentClick(commentId, locationData);
    }
  };

  // Handle replying to a comment
  const handleReplyClick = (commentId: string) => {
    setReplyToCommentId(commentId);
    setSelectionDetails(null);
    setShowInputForm(true);
  };

  // Fetch comments when versionId changes
  React.useEffect(() => {
    if (versionId) {
      fetchComments();
    }
  }, [versionId, fetchComments]);

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
      {loading && comments.length === 0 && (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading comments...</span>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
          <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground/60" />
          <p>No comments yet for this document.</p>
          <p className="text-sm">Select text in the document to add comments.</p>
        </div>
      )}
      
      {/* Comments list */}
      {comments.length > 0 && (
        <DocumentCommentsList 
          comments={comments}
          loading={loading}
          onCommentClick={handleCommentClick}
          onToggleResolved={toggleResolved}
          onReplyClick={handleReplyClick}
          activeCommentId={activeCommentId}
        />
      )}
      
      {/* Comment Input Form */}
      {showInputForm && (
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
