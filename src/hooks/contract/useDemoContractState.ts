
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useContractAnalysisState } from '@/hooks/contract/useContractAnalysisState';
import { useContractQuestionAnswer, QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { mockQuestionHistory, mockSummaryData, mockDocumentMetadata, sampleContractText } from '@/hooks/contract-analysis/mockData';

export const useDemoContractState = () => {
  const [searchParams] = useSearchParams();
  const analysisState = useContractAnalysisState();
  const questionAnswerState = useContractQuestionAnswer();
  
  useEffect(() => {
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    // Initialize with demo data
    if (!analysisState.documentMetadata) {
      analysisState.setDocumentMetadata(mockDocumentMetadata);
    }
    
    if (!analysisState.contractText) {
      analysisState.setContractText(sampleContractText);
    }
    
    if (!analysisState.customSummary) {
      analysisState.setCustomSummary(mockSummaryData);
    }
    
    // In demo mode, pre-populate with mock data if no real data exists
    if (!questionAnswerState.questionHistory || questionAnswerState.questionHistory.length === 0) {
      const mockHistoryWithType = mockQuestionHistory.map(item => ({
        id: item.id,
        question: item.question,
        answer: typeof item.answer === 'string' ? item.answer : item.answer.answer,
        timestamp: typeof item.timestamp === 'number' ? new Date(item.timestamp) : new Date(),
        type: 'question' as const
      }));
      questionAnswerState.setQuestionHistory(mockHistoryWithType);
    }
    
    if (shouldAnalyze && !analysisState.isAnalyzing) {
      toast.success("Demo contract analysis complete!", {
        description: "Explore AI insights, ask questions, and see risk analysis",
        duration: 4000
      });
    }
  }, [searchParams, analysisState, questionAnswerState]);

  return {
    analysisState,
    questionAnswerState,
    sampleContractText
  };
};
