
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QuestionHistoryItem } from '@/types/contract';

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = useCallback(async (question: string) => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setError(null);
    setIsProcessing(true);

    // Add the question to history with isProcessing flag
    const questionId = uuidv4();
    const newQuestion: QuestionHistoryItem = {
      id: questionId,
      question,
      answer: "",
      timestamp: new Date(),
      isProcessing: true
    };

    setQuestionHistory(prev => [newQuestion, ...prev]);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockResponse = `This is a sample answer to your question about "${question}". In a real implementation, this would come from an AI assistant with contract expertise.`;

      // Update the question in history with the answer
      setQuestionHistory(prev =>
        prev.map(q =>
          q.id === questionId
            ? { ...q, answer: mockResponse, isProcessing: false }
            : q
        )
      );
    } catch (err) {
      console.error('Error asking question:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get answer';
      
      // Update the question in history with the error
      setQuestionHistory(prev =>
        prev.map(q =>
          q.id === questionId
            ? { ...q, answer: `Error: ${errorMessage}`, isProcessing: false }
            : q
        )
      );
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    questionHistory,
    isProcessing,
    error,
    handleAskQuestion,
    setError
  };
};
