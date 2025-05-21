
import React from 'react';
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  progress: number;
  startTime: Date | null;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress, startTime }) => {
  const getAnalysisTime = () => {
    if (!startTime) return null;
    
    const elapsedMs = new Date().getTime() - startTime.getTime();
    const seconds = Math.floor(elapsedMs / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground mb-2">Analyzing document...</p>
      {progress > 0 && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {getAnalysisTime() ? `Analysis time: ${getAnalysisTime()}` : 'Initializing analysis'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisProgress;
