
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';

interface DocumentSelectionActionsProps {
  buttonPosition: { top: number; left: number } | null;
  onExplain: () => void;
  onAddComment: () => void;
}

const DocumentSelectionActions: React.FC<DocumentSelectionActionsProps> = ({
  buttonPosition,
  onExplain,
  onAddComment,
}) => {
  if (!buttonPosition) return null;
  
  return (
    <div
      className="absolute z-10 flex gap-2"
      style={{ 
        top: `${buttonPosition.top}px`, 
        left: `${buttonPosition.left}px`,
        transform: 'translateX(-50%)' // Center horizontally
      }}
      id="selection-buttons"
    >
      <Button
        onClick={onExplain}
        className="text-xs"
        size="sm"
      >
        Explain
      </Button>
      <Button
        onClick={onAddComment}
        className="text-xs"
        size="sm"
        variant="secondary"
        id="add-comment-button"
      >
        <MessageSquarePlus className="mr-1 h-3 w-3" /> Comment
      </Button>
    </div>
  );
};

export default DocumentSelectionActions;
