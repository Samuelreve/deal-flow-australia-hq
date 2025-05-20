
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const ProfessionalDirectoryPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}) => {
  // Don't show pagination if we only have one page
  if (totalPages <= 1) return null;
  
  const handlePageChange = (page: number) => {
    if (page === currentPage || isLoading) return;
    onPageChange(page);
  };
  
  // Create array of page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    // If current page is more than 3, add ellipsis
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Add page numbers around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as we always show them
      pages.push(i);
    }
    
    // If current page is less than totalPages-2, add ellipsis
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(currentPage - 1)}
            className={currentPage === 1 || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
          />
        </PaginationItem>
        
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === 'number' ? (
              <PaginationLink 
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
                className={isLoading ? 'pointer-events-none' : 'cursor-pointer'}
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageChange(currentPage + 1)}
            className={currentPage === totalPages || isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProfessionalDirectoryPagination;
