
import React from 'react';
import ContractAnalyzingState from './ContractAnalyzingState';
import ContractSummaryTab from './tabs/ContractSummaryTab';
import DocumentTab from './tabs/DocumentTab';
import EnhancedContractAssistantTab from './tabs/EnhancedContractAssistantTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionHistoryItem } from '@/types/contract';
import { mockAnalysisResponses } from '@/hooks/contract-analysis/mockData';

interface ContractMainContentProps {
  isAnalyzing: boolean;
  analysisStage: string;
  analysisProgress: number;
  activeTab: string;
  customSummary: any;
  mockSummary: any;
  contractText: string;
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
  onTabChange: (tab: string) => void;
  onAskQuestion: (question: string, contractText: string) => Promise<string | { answer: string; sources?: string[] }>;
}

const ContractMainContent: React.FC<ContractMainContentProps> = ({
  isAnalyzing,
  analysisStage,
  analysisProgress,
  activeTab,
  customSummary,
  mockSummary,
  contractText,
  questionHistory,
  isProcessing,
  onTabChange,
  onAskQuestion
}) => {
  // Mock analysis function that uses standardized mock responses
  const handleAnalyzeContract = async (analysisType: string) => {
    // Return mock response for the requested analysis type or a default response
    return mockAnalysisResponses[analysisType as keyof typeof mockAnalysisResponses] || 
      { answer: "Analysis complete." };
  };

  if (isAnalyzing) {
    return (
      <ContractAnalyzingState 
        stage={analysisStage}
        progress={analysisProgress}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="document">Document</TabsTrigger>
        <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-6">
        <ContractSummaryTab 
          summaryData={customSummary}
          mockSummary={mockSummary}
        />
      </TabsContent>

      <TabsContent value="document" className="space-y-6">
        <DocumentTab contractText={contractText} />
      </TabsContent>

      <TabsContent value="assistant" className="space-y-6">
        <EnhancedContractAssistantTab
          onAskQuestion={onAskQuestion}
          onAnalyzeContract={handleAnalyzeContract}
          questionHistory={questionHistory}
          isProcessing={isProcessing}
          contractText={contractText}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ContractMainContent;
