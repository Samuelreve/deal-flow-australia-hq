
import React from 'react';
import { Loader2 } from 'lucide-react';
import ContractSummaryRenderer from '@/components/contract-analysis/renderers/ContractSummaryRenderer';

interface SummaryTabProps {
  summaryResult: any;
  isAnalyzing: boolean;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ summaryResult, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing contract with AI...</p>
      </div>
    );
  }
  
  if (!summaryResult) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No contract analysis available. Please wait while the AI analyzes the contract.
        </p>
      </div>
    );
  }

  // Transform summary result to match renderer format
  const transformedContent = {
    summary: summaryResult.summary || summaryResult.summaryText,
    keyPoints: summaryResult.keyPoints || [],
    documentType: summaryResult.documentType || "Contract",
    wordCount: summaryResult.wordCount,
    disclaimer: summaryResult.disclaimer
  };
  
  return <ContractSummaryRenderer content={transformedContent} />;
};

export default SummaryTab;
