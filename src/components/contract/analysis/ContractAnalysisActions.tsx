
import { QuestionHistoryItem } from '@/types/contract';

interface ContractAnalysisActionsProps {
  contractText: string;
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
}

export const useContractAnalysisActions = ({
  contractText,
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing
}: ContractAnalysisActionsProps) => {
  const handleQuestionSubmission = async (question: string) => {
    if (!contractText) {
      return null;
    }
    return onAskQuestion(question);
  };
  
  const handleContractAnalysis = async (analysisType: string) => {
    if (!contractText) {
      return null;
    }
    return onAnalyzeContract(analysisType);
  };

  return {
    handleQuestionSubmission,
    handleContractAnalysis
  };
};
