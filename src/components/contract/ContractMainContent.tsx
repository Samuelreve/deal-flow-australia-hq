
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContractAnalyzingState from './ContractAnalyzingState';
import ContractSummaryTab from './tabs/ContractSummaryTab';
import ContractAssistantTab from './tabs/ContractAssistantTab';
import DocumentTab from './tabs/DocumentTab';

interface ContractMainContentProps {
  isAnalyzing: boolean;
  analysisStage: string;
  analysisProgress: number;
  activeTab: string;
  customSummary: any;
  mockSummary: any;
  contractText: string;
  questionHistory: any[];
  isProcessing: boolean;
  onTabChange: (tab: string) => void;
  onAskQuestion: (question: string) => void;
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
  if (isAnalyzing) {
    return <ContractAnalyzingState stage={analysisStage} progress={analysisProgress} />;
  }

  return (
    <Tabs defaultValue="summary" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="summary">Contract Summary</TabsTrigger>
        <TabsTrigger value="assistant">Ask Questions</TabsTrigger>
        <TabsTrigger value="document">Full Document</TabsTrigger>
      </TabsList>
      
      {/* Summary Tab */}
      <TabsContent value="summary">
        <ContractSummaryTab summaryData={customSummary || mockSummary} />
      </TabsContent>
      
      {/* Assistant Tab */}
      <TabsContent value="assistant">
        <ContractAssistantTab 
          onAskQuestion={onAskQuestion}
          questionHistory={questionHistory}
          isProcessing={isProcessing} 
        />
      </TabsContent>
      
      {/* Document Tab */}
      <TabsContent value="document">
        <DocumentTab contractText={contractText} />
      </TabsContent>
    </Tabs>
  );
};

export default ContractMainContent;
