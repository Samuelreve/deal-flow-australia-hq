
import { useState, useCallback } from 'react';
import { QuestionAnswerState, QuestionHistoryItem } from '@/types/contract';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useContractQuestionAnswer = () => {
  const [state, setState] = useState<QuestionAnswerState>({
    questionHistory: [],
    isProcessing: false,
    error: null
  });

  const handleAskQuestion = useCallback(async (question: string, contractText: string): Promise<string | { answer: string; sources?: string[] }> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: { question, contractText }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process question');
      }

      // Format the answer
      const result = {
        answer: data.answer,
        sources: data.sources
      };

      // Create a new history item
      const newHistoryItem: QuestionHistoryItem = {
        id: `q-${Date.now()}`,
        question,
        answer: result,
        timestamp: new Date()
      };

      // Update state with the new history item
      setState(prev => ({
        ...prev,
        questionHistory: [newHistoryItem, ...prev.questionHistory],
        isProcessing: false,
        error: null
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process question';
      
      toast.error(errorMessage);
      
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
