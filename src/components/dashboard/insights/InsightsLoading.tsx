
import React from 'react';

const InsightsLoading = () => {
  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <div className="animate-pulse flex space-x-4 w-full max-w-md">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Analyzing your deal portfolio...</p>
    </div>
  );
};

export default InsightsLoading;
