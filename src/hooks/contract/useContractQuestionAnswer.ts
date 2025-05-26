
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface QuestionHistoryItem {
  id?: string;
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
  isProcessing?: boolean;
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = useCallback(async (question: string, contractText: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Asking question:', question);
      
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'explain_clause',
          content: question,
          context: { contractContent: contractText }
        }
      });
      
      console.log('AI Response data:', data);
      console.log('AI Response error:', error);
      
      if (error) {
        throw new Error(error.message || 'Failed to get AI response');
      }
      
      // Handle different response formats
      let answer: string;
      if (data && typeof data === 'object') {
        // Try different possible response fields
        answer = data.explanation || data.answer || data.response || data.result || 'No response received';
      } else if (typeof data === 'string') {
        answer = data;
      } else {
        throw new Error('No explanation received from AI service');
      }
      
      console.log('Processed answer:', answer);
      
      setQuestionHistory(prev => [
        ...prev,
        {
          id: `question-${Date.now()}`,
          question,
          answer,
          timestamp: Date.now(),
          type: 'question'
        }
      ]);
      
      return { answer };
    } catch (error: any) {
      console.error('Error asking question:', error);
      const errorMessage = error.message || 'Failed to process your question';
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleAnalyzeContract = useCallback(async (analysisType: string, contractText: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Analyzing contract:', analysisType);
      
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'analyze_document',
          content: contractText,
          context: { analysisType }
        }
      });
      
      console.log('Analysis response data:', data);
      console.log('Analysis response error:', error);
      
      if (error) {
        throw new Error(error.message || 'Failed to analyze contract');
      }
      
      // Handle different response formats
      let analysis: string;
      if (data && typeof data === 'object') {
        // Try different possible response fields
        analysis = data.analysis?.content || data.summary || data.explanation || data.result || `Analysis of type ${analysisType} completed`;
      } else if (typeof data === 'string') {
        analysis = data;
      } else {
        analysis = `Analysis of type ${analysisType} completed`;
      }
      
      console.log('Processed analysis:', analysis);
      
      setQuestionHistory(prev => [
        ...prev,
        {
          id: `analysis-${Date.now()}`,
          question: `Analyze contract: ${analysisType}`,
          answer: analysis,
          timestamp: Date.now(),
          type: 'analysis',
          analysisType
        }
      ]);
      
      return { analysis };
    } catch (error: any) {
      console.error(`Error analyzing contract (${analysisType}):`, error);
      const errorMessage = error.message || `Failed to analyze contract: ${analysisType}`;
      throw new Error(errorMessage);
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
