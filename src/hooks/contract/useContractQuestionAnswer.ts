
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Update the QuestionHistoryItem to include the required 'type' property
export interface QuestionHistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis'; // Adding the type property
  analysisType?: string;
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = useCallback(async (question: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - in a real app, this would call an AI service
      const answer = `This is a simulated answer to your question: "${question}"`;
      
      const newItem: QuestionHistoryItem = {
        question,
        answer,
        timestamp: Date.now(),
        type: 'question' // Added the required type property
      };
      
      setQuestionHistory(prev => [...prev, newItem]);
      
      return { question, answer };
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to process your question');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Adapter function to match the component's expected signature
  const adaptedHandleAskQuestion = (question: string) => {
    return handleAskQuestion(question);
  };

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion: adaptedHandleAskQuestion,
    setQuestionHistory
  };
};
