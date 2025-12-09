import React from 'react';
import { cn } from '@/lib/utils';

interface StreamingCursorProps {
  className?: string;
}

export const StreamingCursor: React.FC<StreamingCursorProps> = ({ className }) => {
  return (
    <span 
      className={cn(
        "inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse",
        className
      )}
      aria-hidden="true"
    />
  );
};

export default StreamingCursor;
