
import React from 'react';
import ContractAnalyzingState from './ContractAnalyzingState';
import ContractSummaryTab from './tabs/ContractSummaryTab';
import DocumentTab from './tabs/DocumentTab';
import EnhancedContractAssistantTab from './tabs/EnhancedContractAssistantTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionHistoryItem } from '@/types/contract';

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
  // Mock analysis function for different analysis types
  const handleAnalyzeContract = async (analysisType: string) => {
    // Simulate different analysis types
    const analysisResponses = {
      summary: { answer: "This is a comprehensive contract summary analyzing the main terms, parties involved, and key obligations. The contract establishes a mutual non-disclosure agreement between two companies with specific confidentiality requirements and a 3-year term." },
      risks: { answer: "Key risks identified:\n• Broad definition of confidential information could lead to disputes\n• 5-year post-termination confidentiality period may be excessive\n• Limited remedies specified for breach\n• No specific carve-outs for independently developed information" },
      keyTerms: { answer: "Key terms and clauses:\n• Effective Date: June 1, 2023\n• Term: 3 years with 5-year survival for confidentiality\n• Governing Law: State of New York\n• Termination: 30 days written notice\n• Remedies: Injunctive relief available\n• No IP rights granted" },
      suggestions: { answer: "Recommendations for improvement:\n• Add specific carve-outs for publicly available information\n• Include return/destruction of confidential information clause\n• Consider reducing post-termination confidentiality period\n• Add dispute resolution mechanism\n• Clarify what constitutes 'reasonable person' standard" }
    };

    return analysisResponses[analysisType as keyof typeof analysisResponses] || { answer: "Analysis complete." };
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
          customSummary={customSummary}
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
