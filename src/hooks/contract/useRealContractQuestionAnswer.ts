
import { useState, useCallback, useEffect } from 'react';
import { QuestionAnswerState, QuestionHistoryItem } from '@/types/contract';
import { supabase } from '@/integrations/supabase/client';
import { realContractService } from '@/services/realContractService';
import { toast } from 'sonner';

export const useRealContractQuestionAnswer = (contractId: string | null) => {
  const [state, setState] = useState<QuestionAnswerState>({
    questionHistory: [],
    isProcessing: false,
    error: null
  });

  const loadQuestionHistory = useCallback(async () => {
    if (!contractId) return;

    try {
      const questions = await realContractService.getContractQuestions(contractId);
      const history: QuestionHistoryItem[] = questions.map(q => ({
        id: q.id,
        question: q.question,
        answer: {
          answer: q.answer,
          sources: q.sources
        },
        timestamp: new Date(q.created_at)
      }));
      
      setState(prev => ({ ...prev, questionHistory: history }));
    } catch (error) {
      console.error('Error loading question history:', error);
    }
  }, [contractId]);

  const handleAskQuestion = useCallback(async (question: string, contractText: string): Promise<string | { answer: string; sources?: string[] }> => {
    if (!contractId) {
      throw new Error('No contract selected');
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Call our Supabase Edge Function with the contract ID
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: { 
          question, 
          contractText,
          contractId // Pass the contract ID for proper saving
        }
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
  }, [contractId]);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, questionHistory: [] }));
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      questionHistory: prev.questionHistory.filter(item => item.id !== questionId)
    }));
  }, []);

  // Load question history when contract changes
  useEffect(() => {
    loadQuestionHistory();
  }, [loadQuestionHistory]);

  return {
    ...state,
    handleAskQuestion,
    clearHistory,
    removeQuestion,
    refreshHistory: loadQuestionHistory
  };
};
