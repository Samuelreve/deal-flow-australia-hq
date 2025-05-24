
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface QuestionHistoryItem {
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = useCallback(async (question: string, contractContent?: string) => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return null;
    }

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to ask questions');
      }

      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'explain_clause',
          content: question,
          context: { contractContent: contractContent || '' },
          userId: user.id
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to process your question');
      }
      
      const answer = data?.explanation || 'No response received';
      
      const historyItem: QuestionHistoryItem = {
        question,
        answer,
        timestamp: Date.now(),
        type: 'question'
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { question, answer };
    } catch (error: any) {
      console.error('Error asking question:', error);
      toast.error(error.message || 'Failed to process your question');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleAnalyzeContract = useCallback(async (analysisType: string, contractContent?: string) => {
    if (!contractContent) {
      toast.error('No contract content available for analysis');
      return null;
    }

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to analyze contracts');
      }

      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'analyze_document',
          content: contractContent,
          context: { analysisType },
          userId: user.id
        }
      });
      
      if (error) {
        throw new Error(error.message || `Failed to analyze contract: ${analysisType}`);
      }
      
      const analysis = data?.analysis?.content || `Analysis of type ${analysisType} completed`;
      
      const historyItem: QuestionHistoryItem = {
        question: `Analyze contract: ${analysisType}`,
        answer: typeof analysis === 'string' ? analysis : JSON.stringify(analysis),
        timestamp: Date.now(),
        type: 'analysis',
        analysisType
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { analysisType, analysis };
    } catch (error: any) {
      console.error(`Error analyzing contract (${analysisType}):`, error);
      toast.error(error.message || `Failed to analyze contract: ${analysisType}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    setQuestionHistory,
    clearHistory: () => setQuestionHistory([])
  };
};
