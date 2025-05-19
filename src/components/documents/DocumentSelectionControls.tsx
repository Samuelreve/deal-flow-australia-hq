
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, BookOpen } from 'lucide-react';

interface DocumentSelectionControlsProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  aiLoading?: boolean;
  onExplain: () => void;
  onAddComment: () => void;
}

const DocumentSelectionControls: React.FC<DocumentSelectionControlsProps> = ({
  selectedText,
  buttonPosition,
  aiLoading,
  onExplain,
  onAddComment,
}) => {
  if (!selectedText || !buttonPosition) return null;
  
  return (
    <div 
      className="absolute bg-background border rounded-md shadow-md p-1 flex gap-1 z-10 transform -translate-x-1/2"
      style={{ 
        top: `${buttonPosition.top}px`, 
        left: `${buttonPosition.left}px`,
      }}
    >
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-1"
        onClick={onExplain}
        disabled={aiLoading}
      >
        {aiLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Explain</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-1"
        onClick={onAddComment}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Comment</span>
      </Button>
    </div>
  );
};

export default DocumentSelectionControls;
