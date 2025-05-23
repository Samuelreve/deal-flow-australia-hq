
import { useState } from 'react';
import { toast } from 'sonner';
import { QuestionHistoryItem, DealHealthPrediction } from './types/contractQuestionTypes';
import { generateMockAnswer, generateMockDealHealthPrediction } from './mockData/questionAnswerMocks';

export type { QuestionHistoryItem } from './types/contractQuestionTypes';

export function useContractQuestionAnswer() {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async (question: string): Promise<{ answer: string } | undefined> => {
    if (!question.trim()) {
      toast.error("Question cannot be empty");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock response
      const answer = generateMockAnswer(question);
      
      const newItem: QuestionHistoryItem = {
        question,
        answer,
        timestamp: Date.now(),
        type: 'question'
      };
      
      setQuestionHistory(prev => [...prev, newItem]);
      
      return { answer };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process question';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDealHealthPrediction = async (dealId: string): Promise<DealHealthPrediction> => {
    if (!dealId.trim()) {
      const error = "Deal ID is required";
      toast.error(error);
      throw new Error(error);
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock implementation result
      return generateMockDealHealthPrediction(dealId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate health prediction';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearHistory = () => {
    setQuestionHistory([]);
    setError(null);
  };

  return {
    questionHistory,
    setQuestionHistory,
    isProcessing,
    error,
    handleAskQuestion,
    handleDealHealthPrediction,
    clearHistory
  };
}
