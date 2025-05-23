
import { useState, useCallback } from 'react';
import { QuestionAnswerState, QuestionHistoryItem } from '@/types/contract';

export const useContractQuestionAnswer = () => {
  const [state, setState] = useState<QuestionAnswerState>({
    questionHistory: [],
    isProcessing: false,
    error: null
  });

  const handleAskQuestion = useCallback(async (question: string): Promise<string | { answer: string; sources?: string[] }> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockAnswer = {
        answer: `This is a mock response to: "${question}". In a real implementation, this would be processed by an AI service.`,
        sources: ["Contract Section 2.1", "Clause 4.3"]
      };

      const newHistoryItem: QuestionHistoryItem = {
        id: `q-${Date.now()}`,
        question,
        answer: mockAnswer,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        questionHistory: [newHistoryItem, ...prev.questionHistory],
        isProcessing: false,
        error: null
      }));

      return mockAnswer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process question';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      throw new Error(errorMessage);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, questionHistory: [] }));
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      questionHistory: prev.questionHistory.filter(item => item.id !== questionId)
    }));
  }, []);

  return {
    ...state,
    handleAskQuestion,
    clearHistory,
    removeQuestion
  };
};
