
import { useCallback } from 'react';
import { useQuestionHistory } from './useQuestionHistory';
import { useQuestionProcessing } from './useQuestionProcessing';

/**
 * Main hook for contract question answering functionality
 */
export const useQuestionAnswering = () => {
  const { questionHistory, addQuestionToHistory } = useQuestionHistory();
  const { isProcessing, processQuestion } = useQuestionProcessing();

  const handleAskQuestion = useCallback(async (question: string) => {
    if (!question.trim()) {
      throw new Error('Please enter a question');
    }

    try {
      const answer = await processQuestion(question);
      addQuestionToHistory(question, answer);
      
      return {
        answer,
        sources: [] // Would be populated by real AI service
      };
    } catch (error) {
      console.error('Failed to ask question:', error);
      throw error;
    }
  }, [processQuestion, addQuestionToHistory]);

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion
  };
};
