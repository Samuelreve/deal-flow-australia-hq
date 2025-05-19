
import React, { useEffect, useState } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCommentForm from './DocumentCommentForm';
import DocumentCommentsList from './DocumentCommentsList';
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
  const { comments, loading, fetchComments, toggleResolved } = useDocumentComments(versionId);
  const { user } = useAuth();
  
  // State for managing the comment form
  const [showInputForm, setShowInputForm] = useState(false);
  const [selectionDetails, setSelectionDetails] = useState<{
    selectedText: string | null;
    pageNumber?: number;
    locationData: any;
  } | null>(null);

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
  };

  // Handle comment cancellation
  const handleCancelInput = () => {
    setShowInputForm(false);
    setSelectionDetails(null);
  };

  // Handle comment posted successfully
  const handleCommentPosted = () => {
    setShowInputForm(false);
    setSelectionDetails(null);
    // Refresh comments list
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
      
      <DocumentCommentsList 
        comments={comments}
        loading={loading}
        onCommentClick={handleCommentClick}
        onToggleResolved={toggleResolved}
      />
      
      {/* Comment Input Form */}
      {showInputForm && selectionDetails && (
        <div className="mt-4 border-t pt-4">
          <DocumentCommentForm
            selectedText={selectionDetails.selectedText}
            buttonPosition={null} // Not applicable in sidebar context
            pageNumber={selectionDetails.pageNumber}
            locationData={selectionDetails.locationData}
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
