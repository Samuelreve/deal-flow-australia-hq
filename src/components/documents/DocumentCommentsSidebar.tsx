
import React, { useState } from 'react';
import { DocumentComment } from '@/services/documentComment';
import { Loader2 } from 'lucide-react';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

interface DocumentCommentsSidebarProps {
  comments: DocumentComment[];
  loading: boolean;
  onCommentClick?: (commentId: string, locationData: any) => void;
}

const DocumentCommentsSidebar: React.FC<DocumentCommentsSidebarProps> = ({ 
  comments, 
  loading,
  onCommentClick 
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(comments.length / commentsPerPage));
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  
  // Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <div className="h-full w-1/3 border rounded-lg overflow-y-auto bg-background p-4 flex flex-col">
      <h3 className="font-medium mb-4">Comments</h3>
      
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading comments...</span>
          </div>
        ) : currentComments.length > 0 ? (
          <div className="space-y-4">
            {currentComments.map((comment) => (
              <div 
                key={comment.id} 
                className="border rounded-md p-3 bg-card hover:bg-accent/80 cursor-pointer transition-colors"
                onClick={() => onCommentClick?.(comment.id, comment.locationData)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium">{comment.user?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
                
                {comment.locationData?.selectedText && (
                  <div className="mt-1 text-xs italic bg-muted p-2 rounded">
                    "{comment.locationData.selectedText}"
                  </div>
                )}
                
                <div className="mt-2">{comment.content}</div>
                
                {comment.pageNumber && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Page {comment.pageNumber}
                  </div>
                )}
                
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-3 border-l-2">
                    <p className="text-xs text-muted-foreground mb-2">{comment.replies.length} replies</p>
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
      </div>
      
      {/* Pagination UI */}
      {!loading && comments.length > 0 && totalPages > 1 && (
        <div className="mt-4 border-t pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show current page, first, last, and pages around current
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        isActive={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                // Show ellipsis for gaps
                else if (
                  (pageNumber === 2 && currentPage > 3) || 
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <div className="flex h-9 w-9 items-center justify-center">...</div>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DocumentCommentsSidebar;
