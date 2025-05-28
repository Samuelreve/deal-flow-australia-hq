
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
  sources?: string[];
  isProcessing?: boolean;
}

export const useContractQuestionAnswer = () => {
  const { user } = useAuth();
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = useCallback(async (question: string, contractText: string) => {
    if (!user || !contractText) {
      toast.error('Unable to process question', {
        description: 'Please ensure you are logged in and have uploaded a contract.'
      });
      return null;
    }

    console.log('Processing question:', question);
    setIsProcessing(true);
    
    // Add processing item to history
    const processingId = Date.now().toString();
    const processingItem: QuestionHistoryItem = {
      id: processingId,
      question,
      answer: 'Processing...',
      timestamp: Date.now(),
      type: 'question',
      isProcessing: true
    };
    
    setQuestionHistory(prev => [...prev, processingItem]);

    try {
      // Use contract-assistant for questions
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question,
          contractText,
          contractId: `temp-${Date.now()}`
        }
      });

      if (!error && data) {
        console.log('Question answered successfully:', data);
        const finalItem: QuestionHistoryItem = {
          id: processingId,
          question,
          answer: data.answer || 'No answer provided',
          timestamp: Date.now(),
          type: 'question',
          sources: data.sources || [],
          isProcessing: false
        };

        setQuestionHistory(prev => 
          prev.map(item => item.id === processingId ? finalItem : item)
        );

        toast.success('Question answered!', {
          description: 'AI has provided an answer based on your contract.'
        });

        return { answer: data.answer, sources: data.sources };
      }

      throw new Error('AI service unavailable');
      
    } catch (error: any) {
      console.error('Error asking question:', error);
      
      // Update with error state
      const errorItem: QuestionHistoryItem = {
        id: processingId,
        question,
        answer: 'Sorry, I could not process your question at this time. Please try again later.',
        timestamp: Date.now(),
        type: 'question',
        isProcessing: false
      };

      setQuestionHistory(prev => 
        prev.map(item => item.id === processingId ? errorItem : item)
      );

      toast.error('Question processing failed', {
        description: 'AI services are temporarily unavailable. Please try again later.'
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const handleAnalyzeContract = useCallback(async (analysisType: string, contractText: string) => {
    if (!user || !contractText) {
      toast.error('Unable to analyze contract', {
        description: 'Please ensure you are logged in and have uploaded a contract.'
      });
      return null;
    }

    console.log('Processing contract analysis:', analysisType);
    setIsProcessing(true);

    // Add processing item to history
    const processingId = Date.now().toString();
    const processingItem: QuestionHistoryItem = {
      id: processingId,
      question: `Analyze contract for: ${analysisType}`,
      answer: 'Analyzing...',
      timestamp: Date.now(),
      type: 'analysis',
      analysisType,
      isProcessing: true
    };
    
    setQuestionHistory(prev => [...prev, processingItem]);

    try {
      // Create analysis-specific questions for different analysis types
      let analysisQuestion = '';
      
      switch (analysisType) {
        case 'risks':
          analysisQuestion = 'Please identify and analyze all potential risks, liabilities, and legal concerns in this contract. Focus on areas that could cause problems for either party, including liability limitations, penalty clauses, and uncertain terms.';
          break;
        case 'obligations':
          analysisQuestion = 'Please extract and summarize all key obligations and responsibilities for each party in this contract. Include deliverables, deadlines, performance requirements, and compliance obligations.';
          break;
        case 'summary':
          analysisQuestion = 'Please provide a comprehensive summary of this contract, including its purpose, key terms, important dates, financial obligations, and main provisions.';
          break;
        default:
          analysisQuestion = `Please analyze this contract focusing on: ${analysisType}. Provide detailed insights and key findings.`;
      }

      // Use contract-assistant for analysis by asking targeted questions
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question: analysisQuestion,
          contractText,
          contractId: `analysis-${Date.now()}`
        }
      });

      if (!error && data) {
        console.log('Contract analysis completed:', data);
        const finalItem: QuestionHistoryItem = {
          id: processingId,
          question: `Analyze contract for: ${analysisType}`,
          answer: data.answer || 'Analysis completed',
          timestamp: Date.now(),
          type: 'analysis',
          analysisType,
          sources: data.sources || [],
          isProcessing: false
        };

        setQuestionHistory(prev => 
          prev.map(item => item.id === processingId ? finalItem : item)
        );

        toast.success('Analysis completed!', {
          description: `Contract ${analysisType} analysis is ready.`
        });

        return { analysis: data.answer, sources: data.sources };
      }

      throw new Error('Analysis service unavailable');
      
    } catch (error: any) {
      console.error('Error analyzing contract:', error);
      
      // Update with error state
      const errorItem: QuestionHistoryItem = {
        id: processingId,
        question: `Analyze contract for: ${analysisType}`,
        answer: 'Analysis could not be completed at this time. Please try again later.',
        timestamp: Date.now(),
        type: 'analysis',
        analysisType,
        isProcessing: false
      };

      setQuestionHistory(prev => 
        prev.map(item => item.id === processingId ? errorItem : item)
      );

      toast.error('Analysis failed', {
        description: 'AI services are temporarily unavailable. Please try again later.'
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  return {
    questionHistory,
    setQuestionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract
  };
};
