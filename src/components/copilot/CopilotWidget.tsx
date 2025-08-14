
import React, { useState, useRef, useCallback, useEffect } from "react";
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

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
}

const CopilotWidget: React.FC<CopilotWidgetProps> = ({ dealId }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 16, y: 16 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0
  });
  const { count } = useDealsCount();
  const isPreDeal = !dealId && (count ?? 0) === 0;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;
    
    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    
    const newX = dragState.startPosX + deltaX;
    const newY = dragState.startPosY + deltaY;
    
    // Keep within viewport bounds with some padding
    const maxX = window.innerWidth - 420 - 16; // copilot width + padding
    const maxY = window.innerHeight - 640 - 16; // copilot height + padding
    
    setPosition({
      x: Math.max(16, Math.min(maxX, newX)),
      y: Math.max(16, Math.min(maxY, newY))
    });
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="pointer-events-none">
      {/* Floating toggle button */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        {!open && (
          <Button
            variant="default"
            size="lg"
            className="shadow-md copilot-gradient text-primary-foreground hover:scale-105 transition-transform"
            onClick={() => {
              setOpen(true);
              setPosition({ x: 16, y: 16 }); // Reset position when opening
            }}
            aria-label="Open Deal Copilot"
          >
            <Brain className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Draggable Copilot Window */}
      {open && (
        <div 
          className="fixed z-50 pointer-events-auto"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: dragState.isDragging ? 'grabbing' : 'default'
          }}
        >
          <div className="relative">
            {/* Close button */}
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
            
            {/* Copilot content with draggable header */}
            <div className="relative">
              {isPreDeal ? (
                <CopilotSuggestions onHeaderMouseDown={handleMouseDown} />
              ) : (
                <CopilotChat dealId={dealId} onHeaderMouseDown={handleMouseDown} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
