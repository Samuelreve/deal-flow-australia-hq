
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
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0
  });
  const { count } = useDealsCount();
  const isPreDeal = !dealId && (count ?? 0) === 0;

  // Calculate initial middle-right position
  const getInitialPosition = (): Position => {
    const copilotWidth = 420;
    const copilotHeight = Math.min(window.innerHeight - 100, 800); // Stretch height, max 800px
    const padding = 16;
    
    return {
      x: window.innerWidth - copilotWidth - padding,
      y: Math.max(50, (window.innerHeight - copilotHeight) / 2) // Center vertically
    };
  };

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
    const copilotHeight = Math.min(window.innerHeight - 100, 800);
    const maxY = window.innerHeight - copilotHeight - 16; // dynamic height + padding
    
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
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
        {!open && (
          <Button
            variant="default"
            size="lg"
            className="copilot-fab copilot-gradient text-primary-foreground border-0 rounded-full w-14 h-14"
            onClick={() => {
              setOpen(true);
              setPosition(getInitialPosition());
            }}
            aria-label="Open Deal Copilot"
          >
            <Brain className="h-6 w-6" />
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
            <div className="absolute -top-3 -right-3 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setOpen(false)} 
                aria-label="Close Copilot"
                className="h-9 w-9 bg-card hover:bg-secondary border-border shadow-lg rounded-full transition-all duration-300 hover:scale-110"
              >
                <span className="text-lg leading-none">×</span>
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
