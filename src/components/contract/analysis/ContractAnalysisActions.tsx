
import React from 'react';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

interface ContractAnalysisActionsProps {
  contractText: string;
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
}

const ContractAnalysisActions: React.FC<ContractAnalysisActionsProps> = ({
  contractText,
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing
}) => {
  const handleQuestionSubmission = async (question: string) => {
    if (!contractText) {
      return null;
    }
    return onAskQuestion(question, contractText);
  };
  
  const handleContractAnalysis = async (analysisType: string) => {
    if (!contractText) {
      return null;
    }
    return onAnalyzeContract(analysisType, contractText);
  };

  return {
    handleQuestionSubmission,
    handleContractAnalysis
  };
};

export default ContractAnalysisActions;
