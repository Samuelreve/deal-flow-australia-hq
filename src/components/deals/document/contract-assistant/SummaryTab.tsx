
import React from 'react';
import { Loader2 } from 'lucide-react';

interface SummaryTabProps {
  summaryResult: any;
  isAnalyzing: boolean;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ summaryResult, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing contract...</p>
      </div>
    );
  }
  
  if (!summaryResult) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No contract summary available. Please wait while the contract is being analyzed.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <h3 className="text-lg font-medium">Contract Summary</h3>
        <div className="whitespace-pre-wrap">
          {summaryResult.summary}
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
