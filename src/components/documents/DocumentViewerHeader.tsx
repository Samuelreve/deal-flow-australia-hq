
import React from 'react';
import CommentSidebarToggle from './CommentSidebarToggle';

interface DocumentViewerHeaderProps {
  commentsCount: number;
  onToggleCommentSidebar: () => void;
}

const DocumentViewerHeader: React.FC<DocumentViewerHeaderProps> = ({
  commentsCount,
  onToggleCommentSidebar
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Document Viewer</h3>
      <CommentSidebarToggle 
        commentsCount={commentsCount} 
        onToggle={onToggleCommentSidebar} 
      />
    </div>
  );
};

export default DocumentViewerHeader;
