
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuestionHistoryItem {
  id?: string;
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
  sources?: string[];
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = async (question: string, contractText: string): Promise<{ answer: string; sources?: string[] } | null> => {
    if (!question.trim()) return null;
    
    setIsProcessing(true);
    
    try {
      // Call the real AI service
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'explain_clause',
          content: question,
          context: { contractContent: contractText },
          dealId: 'contract-analysis', // Using a default dealId for contract analysis
          userId: 'user-id', // This would come from auth context in a real app
        }
      });

      if (error) {
        console.error('AI service error:', error);
        throw new Error('Failed to get AI response');
      }

      const answer = data?.explanation || 'No response received from AI service';
      const sources = data?.sources || ['AI Analysis'];
      
      // Add to history
      const historyItem: QuestionHistoryItem = {
        question,
        answer,
        timestamp: Date.now(),
        type: 'question',
        sources
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { answer, sources };
      
    } catch (error) {
      console.error('Error processing question:', error);
      toast.error('Failed to process your question. Please try again.');
      
      // Fallback response
      const fallbackAnswer = `I'm having trouble processing your question about "${question}" right now. Please check your connection and try again.`;
      
      const historyItem: QuestionHistoryItem = {
        question,
        answer: fallbackAnswer,
        timestamp: Date.now(),
        type: 'question',
        sources: ['System Error']
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { answer: fallbackAnswer, sources: ['System Error'] };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeContract = async (analysisType: string, contractText: string): Promise<{ analysis: string; sources?: string[] } | null> => {
    setIsProcessing(true);
    
    try {
      // Call the real AI service for analysis
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'analyze_document',
          content: contractText,
          context: { analysisType },
          dealId: 'contract-analysis',
          userId: 'user-id',
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw new Error('Failed to get AI analysis');
      }

      const analysis = data?.analysis?.content || data?.analysis || `AI analysis of type ${analysisType} completed`;
      const sources = data?.sources || ['AI Document Analysis'];
      
      const historyItem: QuestionHistoryItem = {
        question: `Contract Analysis: ${analysisType}`,
        answer: analysis,
        timestamp: Date.now(),
        type: 'analysis',
        analysisType,
        sources
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { analysis, sources };
      
    } catch (error) {
      console.error('Error analyzing contract:', error);
      toast.error(`Failed to analyze contract: ${analysisType}`);
      
      // Fallback response
      const fallbackAnalysis = `Unable to complete ${analysisType} analysis at this time. Please check your connection and try again.`;
      
      const historyItem: QuestionHistoryItem = {
        question: `Contract Analysis: ${analysisType}`,
        answer: fallbackAnalysis,
        timestamp: Date.now(),
        type: 'analysis',
        analysisType,
        sources: ['System Error']
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { analysis: fallbackAnalysis, sources: ['System Error'] };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    setQuestionHistory,
    clearHistory: () => setQuestionHistory([])
  };
};
