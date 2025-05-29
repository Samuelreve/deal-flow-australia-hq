
import { useState, useCallback } from 'react';
import { Question } from './types';

export const useQuestionHistory = () => {
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);

  const addQuestionToHistory = useCallback((question: string, answer: string) => {
    const newQuestion: Question = {
      question,
      answer
    };
    setQuestionHistory(prev => [...prev, newQuestion]);
  }, []);

  const clearHistory = useCallback(() => {
    setQuestionHistory([]);
  }, []);

  const getLastQuestion = useCallback(() => {
    return questionHistory.length > 0 ? questionHistory[questionHistory.length - 1] : null;
  }, [questionHistory]);

  return {
    questionHistory,
    addQuestionToHistory,
    clearHistory,
    getLastQuestion
  };
};
