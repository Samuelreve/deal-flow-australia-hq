
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface NotificationPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NotificationPagination: React.FC<NotificationPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {/* First Page */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(1)}>
              1
            </PaginationLink>
          </PaginationItem>
        )}
        
        {/* Ellipsis */}
        {currentPage > 3 && (
          <PaginationItem>
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        )}
        
        {/* Previous Page */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(currentPage - 1)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {/* Current Page */}
        <PaginationItem>
          <PaginationLink isActive>
            {currentPage}
          </PaginationLink>
        </PaginationItem>
        
        {/* Next Page */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(currentPage + 1)}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {/* Ellipsis */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        )}
        
        {/* Last Page */}
        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default NotificationPagination;
