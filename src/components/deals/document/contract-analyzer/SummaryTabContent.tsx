
import React from 'react';
import { Loader2 } from 'lucide-react';

interface SummaryTabContentProps {
  summaryResult: any;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const SummaryTabContent: React.FC<SummaryTabContentProps> = ({
  summaryResult,
  isAnalyzing,
  onAnalyze
}) => {
  React.useEffect(() => {
    if (!summaryResult && !isAnalyzing) {
      onAnalyze();
    }
  }, [summaryResult, isAnalyzing, onAnalyze]);

  if (isAnalyzing) {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Analyzing contract...</p>
      </div>
    );
  }

  if (!summaryResult) {
    return <div className="py-8 text-center">No summary available yet</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Summary</h3>
        <p className="mt-2 whitespace-pre-line">{summaryResult.summary}</p>
      </div>
    </div>
  );
};

export default SummaryTabContent;
