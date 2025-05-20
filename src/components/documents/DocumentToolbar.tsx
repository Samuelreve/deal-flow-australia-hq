
import React from 'react';
import { Button } from '@/components/ui/button';

interface DocumentToolbarProps {
  showExplanation: boolean;
  showCommentInput: boolean;
  selectedText: string | null;
  aiLoading: boolean;
  onExplainClick: () => void;
  onAddCommentClick: () => void;
  buttonPosition: { top: number; left: number } | null;
}

const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  showExplanation,
  showCommentInput,
  selectedText,
  aiLoading,
  onExplainClick,
  onAddCommentClick,
  buttonPosition
}) => {
  if (!selectedText || showExplanation || showCommentInput || !buttonPosition) {
    return null;
  }

  return (
    <div
      className="absolute z-50 flex gap-2"
      style={{
        top: buttonPosition.top + 'px',
        left: buttonPosition.left + 'px',
      }}
    >
      <Button
        size="sm"
        variant="outline"
        className="bg-background"
        onClick={onExplainClick}
        disabled={aiLoading}
      >
        Explain
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="bg-background"
        onClick={onAddCommentClick}
      >
        Comment
      </Button>
    </div>
  );
};

export default DocumentToolbar;
