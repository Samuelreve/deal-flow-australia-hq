
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { AnalysisProgress } from '@/hooks/document-analysis/types';

interface DocumentAnalysisProgressBarProps {
  progress: AnalysisProgress;
}

const DocumentAnalysisProgressBar: React.FC<DocumentAnalysisProgressBarProps> = ({ progress }) => {
  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'initializing': return 'Initializing analysis...';
      case 'processing': return 'Processing document...';
      case 'analyzing': return 'Analyzing content...';
      case 'finalizing': return 'Finalizing results...';
      case 'complete': return 'Analysis complete!';
      default: return 'Working...';
    }
  };

  const getElapsedTime = () => {
    if (!progress.startTime) return '';
    const elapsed = Math.floor((Date.now() - progress.startTime.getTime()) / 1000);
    return elapsed > 0 ? `${elapsed}s` : '';
  };

  return (
    <div className="space-y-3 p-6 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium">{getStageLabel(progress.stage)}</span>
        </div>
        {progress.startTime && (
          <span className="text-sm text-muted-foreground">
            {getElapsedTime()}
          </span>
        )}
      </div>
      
      <Progress value={progress.progress} className="w-full" />
      
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{progress.message || getStageLabel(progress.stage)}</span>
        <span>{Math.round(progress.progress)}%</span>
      </div>
    </div>
  );
};

export default DocumentAnalysisProgressBar;
