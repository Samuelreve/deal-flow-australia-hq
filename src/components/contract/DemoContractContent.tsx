
import React, { useState } from 'react';
import ContractMainContent from '@/components/contract/ContractMainContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DocumentMetadata } from '@/types/contract';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

interface DemoContractContentProps {
  documentMetadata: DocumentMetadata | null;
  contractText: string;
  error: string | null;
  isProcessing: boolean;
  questionHistory: QuestionHistoryItem[];
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  onRetryAnalysis: () => void;
}

const DemoContractContent: React.FC<DemoContractContentProps> = ({
  documentMetadata,
  contractText,
  error,
  isProcessing,
  questionHistory,
  onAskQuestion,
  onAnalyzeContract,
  onRetryAnalysis
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // Create a mock contract for ContractMainContent
  const mockContract = {
    id: 'demo-contract',
    name: 'Demo Mutual NDA',
    content: contractText,
    file_size: contractText.length,
    upload_date: new Date().toISOString(),
    analysis_status: 'completed'
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <ErrorBoundary>
        <ContractMainContent
          selectedContract={mockContract}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAskQuestion={onAskQuestion}
          onAnalyzeContract={onAnalyzeContract}
          questionHistory={questionHistory}
          isProcessing={isProcessing}
          error={error}
          onRetryAnalysis={onRetryAnalysis}
        />
      </ErrorBoundary>
    </div>
  );
};

export default DemoContractContent;
