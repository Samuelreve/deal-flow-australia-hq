import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
  recipientId: string;
  recipientName: string;
}

interface DocxPageViewerProps {
  pages: string[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  signaturePositions: SignaturePosition[];
  onSignaturePositionChange: (positions: SignaturePosition[]) => void;
  signers: Array<{
    email: string;
    name: string;
    recipientId: string;
  }>;
  currentSignerIndex: number | null;
  onSignerSelect: (index: number | null) => void;
}

const DocxPageViewer: React.FC<DocxPageViewerProps> = ({
  pages,
  currentPage,
  totalPages,
  onPageChange,
  signaturePositions,
  onSignaturePositionChange,
  signers,
  currentSignerIndex,
  onSignerSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (currentSignerIndex === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const signer = signers[currentSignerIndex];
    const newPosition: SignaturePosition = {
      x,
      y,
      page: currentPage,
      recipientId: signer.recipientId,
      recipientName: signer.name
    };

    // Remove existing position for this signer on this page
    const filteredPositions = signaturePositions.filter(
      pos => !(pos.recipientId === signer.recipientId && pos.page === currentPage)
    );

    onSignaturePositionChange([...filteredPositions, newPosition]);
  };

  const handleSignatureMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    position: SignaturePosition
  ) => {
    event.stopPropagation();
    setIsDragging(true);
    
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - dragOffset.x;
    const y = event.clientY - rect.top - dragOffset.y;

    // Update the position being dragged
    // This would need more sophisticated state management for which signature is being dragged
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentPagePositions = signaturePositions.filter(pos => pos.page === currentPage);

  const getSignerColor = (recipientId: string) => {
    const index = signers.findIndex(s => s.recipientId === recipientId);
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Document Page */}
      <div className="flex-1 overflow-auto p-4">
        <div
          ref={containerRef}
          className="relative mx-auto cursor-crosshair"
          style={{ maxWidth: '794px' }}
          onClick={handlePageClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* HTML Content */}
          <div
            dangerouslySetInnerHTML={{ __html: pages[currentPage - 1] || '' }}
            className="pointer-events-none"
          />
          
          {/* Signature Positions */}
          {currentPagePositions.map((position, index) => (
            <div
              key={`${position.recipientId}-${position.page}-${index}`}
              className="absolute border-2 border-dashed cursor-move flex items-center justify-center text-xs font-medium text-white rounded px-2 py-1"
              style={{
                left: position.x,
                top: position.y,
                backgroundColor: getSignerColor(position.recipientId),
                borderColor: getSignerColor(position.recipientId),
                minWidth: '120px',
                height: '40px',
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => handleSignatureMouseDown(e, position)}
            >
              {position.recipientName}
            </div>
          ))}
          
          {/* Current Signer Indicator */}
          {currentSignerIndex !== null && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
              Click to place signature for: {signers[currentSignerIndex]?.name}
            </div>
          )}
        </div>
      </div>

      {/* Signer Selection */}
      <div className="border-t p-4">
        <div className="flex flex-wrap gap-2">
          {signers.map((signer, index) => (
            <Button
              key={signer.recipientId}
              variant={currentSignerIndex === index ? "default" : "outline"}
              size="sm"
              onClick={() => onSignerSelect(currentSignerIndex === index ? null : index)}
              style={{
                backgroundColor: currentSignerIndex === index ? getSignerColor(signer.recipientId) : undefined,
                borderColor: getSignerColor(signer.recipientId),
              }}
            >
              {signer.name}
            </Button>
          ))}
        </div>
        {currentSignerIndex === null && (
          <p className="text-sm text-muted-foreground mt-2">
            Select a signer above, then click on the document to place their signature
          </p>
        )}
      </div>
    </div>
  );
};

export default DocxPageViewer;