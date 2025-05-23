
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'progress';
  message?: string;
  progress?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message,
  progress,
  className = ''
}) => {
  const renderContent = () => {
    switch (type) {
      case 'progress':
        return (
          <div className="space-y-4">
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <Progress value={progress || 0} className="w-full" />
            {progress !== undefined && (
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            )}
          </div>
        );

      case 'skeleton':
        return (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full" />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        );
    }
  };

  return (
    <div className={`p-6 ${className}`}>
      {renderContent()}
    </div>
  );
};
