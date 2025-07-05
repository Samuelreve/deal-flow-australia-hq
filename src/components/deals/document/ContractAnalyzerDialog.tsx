
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { useDocumentAI } from "@/hooks/document-ai";
import { toast } from "@/components/ui/use-toast";
import ContractAnalyzerHeader from './contract-analyzer/ContractAnalyzerHeader';
import ContractAnalyzerTabs from './contract-analyzer/ContractAnalyzerTabs';
import SummaryTabContent from './contract-analyzer/SummaryTabContent';
import ExplanationTabContent from './contract-analyzer/ExplanationTabContent';
import QuestionTabContent from './contract-analyzer/QuestionTabContent';
import ContractAnalyzerDisclaimer from './contract-analyzer/ContractAnalyzerDisclaimer';

interface ContractAnalyzerDialogProps {
  dealId: string;
  documentId: string;
  versionId: string;
  userRole?: string;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContractAnalyzerDialog: React.FC<ContractAnalyzerDialogProps> = ({
  dealId,
  documentId,
  versionId,
  userRole = 'user',
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [explanationResult, setExplanationResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const {
    summarizeContract,
    explainContractClause,
    loading: isAnalyzing,
  } = useDocumentAI({ dealId, documentId });

  // Check if user role allows contract analysis
  const canAnalyzeContracts = ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  const handleSummarize = async () => {
    try {
      const result = await summarizeContract(documentId, versionId);
      
      if (result) {
        setSummaryResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Contract summarization failed:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze this contract. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const handleExplainClause = async () => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please enter some text to explain",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await explainContractClause(selectedText, documentId, versionId);
      
      if (result) {
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Clause explanation failed:', error);
      toast({
        title: "Explanation failed",
        description: "Could not explain the selected text. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      toast({
        title: "No question entered",
        description: "Please enter a question about the contract",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await explainContractClause(selectedText || "The entire contract", documentId, versionId);
      
      if (result) {
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Question answering failed:', error);
      toast({
        title: "Failed to answer question",
        description: "Could not answer your question. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  if (!canAnalyzeContracts) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <ContractAnalyzerHeader />
        
        <ContractAnalyzerTabs activeTab={activeTab} setActiveTab={setActiveTab}>
          <TabsContent value="summary">
            <SummaryTabContent 
              summaryResult={summaryResult}
              isAnalyzing={isAnalyzing && activeTab === "summary"}
              onAnalyze={handleSummarize}
            />
          </TabsContent>
          
          <TabsContent value="explanation">
            <ExplanationTabContent 
              selectedText={selectedText}
              setSelectedText={setSelectedText}
              explanationResult={activeTab === "explanation" ? explanationResult : null}
              isAnalyzing={isAnalyzing && activeTab === "explanation"}
              onExplain={handleExplainClause}
            />
          </TabsContent>
          
          <TabsContent value="askQuestion">
            <QuestionTabContent 
              userQuestion={userQuestion}
              setUserQuestion={setUserQuestion}
              explanationResult={activeTab === "askQuestion" ? explanationResult : null}
              isAnalyzing={isAnalyzing && activeTab === "askQuestion"}
              onAskQuestion={handleAskQuestion}
            />
          </TabsContent>
        </ContractAnalyzerTabs>
        
        <ContractAnalyzerDisclaimer disclaimer={disclaimer} />
      </DialogContent>
    </Dialog>
  );
};

export default ContractAnalyzerDialog;
