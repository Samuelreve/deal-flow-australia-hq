import { useState, useCallback } from 'react';
import { realContractService } from '@/services/realContractService';
import { QuestionHistoryItem } from '@/types/contract';

export const useRealContractQuestionAnswerWithCache = (contractId: string | null) => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle asking a question
  const handleAskQuestion = useCallback(async (question: string, contractText: string) => {
    if (!contractId) {
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create optimistic history item
      const newItem: QuestionHistoryItem = {
        id: `question-${Date.now()}`,
        question,
        answer: null,
        timestamp: new Date(),
        type: 'question',
        isProcessing: true
      };

      setQuestionHistory(prev => [...prev, newItem]);

      // Call the service
      const response = await realContractService.askQuestion(contractId, question);

      // Update the history item with the response
      const updatedItem: QuestionHistoryItem = {
        ...newItem,
        answer: response.answer,
        sources: response.sources,
        isProcessing: false
      };

      setQuestionHistory(prev => 
        prev.map(item => item.id === newItem.id ? updatedItem : item)
      );

      return updatedItem;
    } catch (error: any) {
      console.error('Error asking question:', error);
      const errorMessage = error.message || 'Failed to process question';
      setError(errorMessage);

      // Update the history item with error state
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === `question-${Date.now()}` 
            ? { ...item, answer: 'Error processing question', isProcessing: false }
            : item
        )
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId]);

  // Handle contract analysis
  const handleAnalyzeContract = useCallback(async (analysisType: string, contractText: string) => {
    if (!contractId) {
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create analysis question based on type
      const analysisQuestion = getAnalysisQuestion(analysisType);
      
      // Create optimistic history item
      const newItem: QuestionHistoryItem = {
        id: `analysis-${Date.now()}`,
        question: analysisQuestion,
        answer: null,
        timestamp: new Date(),
        type: 'analysis',
        analysisType,
        isProcessing: true
      };

      setQuestionHistory(prev => [...prev, newItem]);

      // Call the service with the analysis question
      const response = await realContractService.askQuestion(contractId, analysisQuestion);

      // Update the history item with the response
      const updatedItem: QuestionHistoryItem = {
        ...newItem,
        answer: response.answer,
        sources: response.sources,
        isProcessing: false
      };

      setQuestionHistory(prev => 
        prev.map(item => item.id === newItem.id ? updatedItem : item)
      );

      return {
        content: response.answer,
        sources: response.sources || []
      };
    } catch (error: any) {
      console.error('Error analyzing contract:', error);
      const errorMessage = error.message || 'Failed to analyze contract';
      setError(errorMessage);

      // Update the history item with error state
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === `analysis-${Date.now()}` 
            ? { ...item, answer: 'Error processing analysis', isProcessing: false }
            : item
        )
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId]);

  // Clear cache/history
  const invalidateCache = useCallback(() => {
    setQuestionHistory([]);
    setError(null);
  }, []);

  return {
    questionHistory,
    isProcessing,
    error,
    handleAskQuestion,
    handleAnalyzeContract,
    invalidateCache
  };
};

// Helper function to generate analysis questions based on type
function getAnalysisQuestion(analysisType: string): string {
  switch (analysisType) {
    case 'summary':
      return 'Please provide a comprehensive summary of this contract, highlighting the key terms, parties involved, and main obligations.';
    case 'risks':
      return 'Please analyze this contract for potential risks, liabilities, and areas of concern that should be reviewed carefully.';
    case 'obligations':
      return 'Please identify and list all the key obligations and responsibilities of each party in this contract.';
    case 'financial-terms':
      return 'Please extract and explain all financial terms, payment schedules, costs, and monetary obligations mentioned in this contract.';
    case 'key-clauses':
      return 'Please identify and explain the most important clauses in this contract, including any special terms or conditions.';
    case 'legal-compliance':
      return 'Please review this contract for legal compliance issues, regulatory requirements, and potential legal concerns.';
    default:
      return `Please provide a ${analysisType} analysis of this contract.`;
  }
}
