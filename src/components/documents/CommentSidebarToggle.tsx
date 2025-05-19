
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface CommentSidebarToggleProps {
  commentsCount: number;
  onToggle: () => void;
}

const CommentSidebarToggle: React.FC<CommentSidebarToggleProps> = ({
  commentsCount,
  onToggle
}) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <MessageSquare className="h-4 w-4" />
      <span>{commentsCount} Comments</span>
    </Button>
  );
};

export default CommentSidebarToggle;
