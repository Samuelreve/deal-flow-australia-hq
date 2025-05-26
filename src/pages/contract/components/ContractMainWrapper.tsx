
import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import OptimizedContractMainContent from '@/components/contract/layout/OptimizedContractMainContent';
import { Contract } from '@/services/realContractService';
import { QuestionHistoryItem } from '@/hooks/contract/types/contractQuestionTypes';

interface ContractMainWrapperProps {
  selectedContract: Contract | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
  error: string | null;
  onRetryAnalysis: () => void;
  isMobile: boolean;
}

const ContractMainWrapper: React.FC<ContractMainWrapperProps> = (props) => {
  return (
    <div 
      id="main-content"
      className="lg:col-span-2"
      tabIndex={-1}
    >
      <ErrorBoundary>
        <OptimizedContractMainContent {...props} />
      </ErrorBoundary>
    </div>
  );
};

export default ContractMainWrapper;
