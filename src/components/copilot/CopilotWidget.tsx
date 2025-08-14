
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import CopilotChat from "./CopilotChat";
import CopilotSuggestions from "./CopilotSuggestions";
import { useDealsCount } from "./useDealsCount";

interface CopilotWidgetProps { dealId?: string }

interface Position {
  x: number;
  y: number;
}

const CopilotWidget: React.FC<CopilotWidgetProps> = ({ dealId }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const { count } = useDealsCount();
  const isPreDeal = !dealId && (count ?? 0) === 0;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 420; // copilot width
    const maxY = window.innerHeight - 640; // copilot height
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="pointer-events-none">
      {/* Floating toggle button */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        {!open && (
          <Button
            variant="default"
            size="lg"
            className="shadow-md copilot-gradient text-primary-foreground hover:scale-105 transition-transform"
            onClick={() => setOpen(true)}
            aria-label="Open Deal Copilot"
          >
            <Brain className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Draggable Surface */}
      {open && (
        <div 
          className="fixed z-50 pointer-events-auto"
          style={{
            bottom: position.y === 0 ? '16px' : 'auto',
            right: position.x === 0 ? '16px' : 'auto',
            left: position.x > 0 ? `${position.x}px` : 'auto',
            top: position.y > 0 ? `${position.y}px` : 'auto',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          ref={dragRef}
          onMouseDown={(e) => {
            // Only start dragging if clicking on the header area
            const target = e.target as HTMLElement;
            if (target.closest('.copilot-gradient')) {
              handleMouseDown(e);
            }
          }}
        >
          <div className="relative">
            {/* Close button only */}
            <div className="absolute -top-2 -right-2 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setOpen(false)} 
                aria-label="Close Copilot"
                className="h-8 w-8 bg-card hover:bg-secondary border-border shadow-md"
              >
                ×
              </Button>
            </div>
            {isPreDeal ? <CopilotSuggestions /> : <CopilotChat dealId={dealId} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
