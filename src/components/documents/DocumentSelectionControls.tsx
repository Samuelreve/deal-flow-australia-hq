
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface DocumentSelectionControlsProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  aiLoading: boolean;
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
  if (!selectedText || !buttonPosition || aiLoading) return null;

  return (
    <div
      className="absolute z-10 bg-white shadow-md rounded-lg p-1 flex gap-2"
      style={{
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <Button
        onClick={onExplain}
        size="sm"
        className="text-xs"
      >
        Explain
      </Button>
      <Button
        onClick={onAddComment}
        size="sm"
        variant="secondary"
        className="text-xs"
      >
        Comment
      </Button>
    </div>
  );
};

export default DocumentSelectionControls;
