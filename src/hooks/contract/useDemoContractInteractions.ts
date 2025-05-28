
import { useCallback } from 'react';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

export const useDemoContractInteractions = () => {
  const handleAnalyzeContract = useCallback(async (
    analysisType: string,
    setQuestionHistory: React.Dispatch<React.SetStateAction<QuestionHistoryItem[]>>
  ) => {
    console.log('Demo contract analysis:', analysisType);
    
    // Create a mock analysis result
    const mockAnalysisResult: QuestionHistoryItem = {
      id: `analysis-${Date.now()}`,
      question: `Analyze contract for: ${analysisType}`,
      answer: `Demo analysis complete for ${analysisType}. This is a simulated analysis result showing key insights and findings.`,
      timestamp: Date.now(),
      type: 'analysis',
      analysisType,
      sources: ['Demo Contract Section 1', 'Demo Contract Section 2']
    };

    // Add to question history
    setQuestionHistory(prev => [...prev, mockAnalysisResult]);
    
    return {
      analysis: mockAnalysisResult.answer,
      sources: mockAnalysisResult.sources
    };
  }, []);

  return {
    handleAnalyzeContract
  };
};
