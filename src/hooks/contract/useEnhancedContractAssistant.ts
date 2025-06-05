
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';

interface UseEnhancedContractAssistantProps {
  dealId?: string;
  documentId?: string;
  versionId?: string;
}

export const useEnhancedContractAssistant = ({
  dealId,
  documentId,
  versionId
}: UseEnhancedContractAssistantProps) => {
  const { user } = useAuth();
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🤖 useEnhancedContractAssistant initialized:', {
    dealId,
    documentId,
    versionId,
    userId: user?.id
  });

  // Ask a question about the contract
  const askQuestion = useCallback(async (question: string) => {
    if (!dealId || !documentId || !versionId) {
      console.error('❌ Missing required IDs for question');
      toast.error('Contract context not available');
      return null;
    }

    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('Please log in to ask questions');
      return null;
    }

    console.log('❓ Asking question:', {
      question: question.substring(0, 100),
      dealId,
      documentId,
      versionId
    });

    setIsProcessing(true);
    setError(null);

    // Add question to history immediately with processing state
    const tempId = `temp-${Date.now()}`;
    const questionItem: QuestionHistoryItem = {
      id: tempId,
      question,
      answer: null,
      timestamp: new Date(),
      type: 'question',
      isProcessing: true
    };
    setQuestionHistory(prev => [...prev, questionItem]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('contract-assistant', {
        body: {
          requestType: 'answer_question',
          dealId,
          documentId,
          versionId,
          userQuestion: question
        }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Failed to process question');
      }

      if (!data?.answer) {
        console.error('❌ No answer received:', data);
        throw new Error('No answer received from AI service');
      }

      console.log('✅ Question answered successfully');

      // Update the question in history with the answer
      const answeredItem: QuestionHistoryItem = {
        ...questionItem,
        id: `qa-${Date.now()}`,
        answer: data.answer,
        sources: data.sources || [],
        isProcessing: false
      };

      setQuestionHistory(prev => 
        prev.map(item => item.id === tempId ? answeredItem : item)
      );

      return {
        answer: data.answer,
        sources: data.sources || []
      };

    } catch (error) {
      console.error('❌ Error asking question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process question';
      setError(errorMessage);

      // Update the question in history with error state
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === tempId 
            ? { ...item, answer: `Error: ${errorMessage}`, isProcessing: false }
            : item
        )
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dealId, documentId, versionId, user]);

  // Summarize contract terms
  const summarizeContractTerms = useCallback(async () => {
    if (!dealId || !documentId || !versionId) {
      console.error('❌ Missing required IDs for summarization');
      toast.error('Contract context not available');
      return null;
    }

    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('Please log in to generate summary');
      return null;
    }

    console.log('📄 Summarizing contract terms:', {
      dealId,
      documentId,
      versionId
    });

    try {
      const { data, error: functionError } = await supabase.functions.invoke('contract-assistant', {
        body: {
          requestType: 'summarize_contract_terms',
          dealId,
          documentId,
          versionId
        }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Failed to generate summary');
      }

      if (!data?.analysis) {
        console.error('❌ No analysis received:', data);
        throw new Error('No analysis received from AI service');
      }

      console.log('✅ Summary generated successfully');

      // Add summary to history as an analysis item
      const summaryItem: QuestionHistoryItem = {
        id: `summary-${Date.now()}`,
        question: 'Contract Summary',
        answer: data.analysis,
        timestamp: new Date(),
        type: 'analysis',
        analysisType: 'summary',
        sources: []
      };

      setQuestionHistory(prev => [summaryItem, ...prev]);

      return data.analysis;

    } catch (error) {
      console.error('❌ Error generating summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setError(errorMessage);
      throw error;
    }
  }, [dealId, documentId, versionId, user]);

  // Analyze contract with specific analysis type
  const analyzeContract = useCallback(async (analysisType: string) => {
    console.log('🔍 Analyzing contract:', { analysisType, dealId, documentId, versionId });

    if (analysisType === 'comprehensive_summary') {
      return summarizeContractTerms();
    }

    // For other analysis types, use the question format
    const analysisQuestions = {
      key_terms: 'Please identify and explain the key terms and definitions in this contract.',
      risk_assessment: 'Please analyze the potential risks and liabilities in this contract.',
      obligations: 'Please list the main obligations and responsibilities of each party.',
      financial_terms: 'Please analyze the financial terms, payment schedules, and monetary obligations.',
      termination: 'Please explain the termination clauses and conditions in this contract.'
    };

    const question = analysisQuestions[analysisType as keyof typeof analysisQuestions] || 
                    `Please provide a detailed analysis of the ${analysisType.replace('_', ' ')} in this contract.`;

    // Add analysis to history immediately
    const tempId = `temp-analysis-${Date.now()}`;
    const analysisItem: QuestionHistoryItem = {
      id: tempId,
      question: `Analysis: ${analysisType.replace('_', ' ').toUpperCase()}`,
      answer: null,
      timestamp: new Date(),
      type: 'analysis',
      analysisType,
      isProcessing: true
    };
    setQuestionHistory(prev => [...prev, analysisItem]);

    try {
      const result = await askQuestion(question);
      
      // Update the analysis item
      if (result) {
        const completedAnalysis: QuestionHistoryItem = {
          ...analysisItem,
          id: `analysis-${Date.now()}`,
          answer: result.answer,
          sources: result.sources,
          isProcessing: false
        };

        setQuestionHistory(prev => 
          prev.map(item => item.id === tempId ? completedAnalysis : item)
        );

        return {
          analysis: result.answer,
          sources: result.sources
        };
      }

      return null;
    } catch (error) {
      // Remove the temp analysis item on error
      setQuestionHistory(prev => prev.filter(item => item.id !== tempId));
      throw error;
    }
  }, [askQuestion, summarizeContractTerms, dealId, documentId, versionId]);

  return {
    questionHistory,
    isProcessing,
    error,
    askQuestion,
    summarizeContractTerms,
    analyzeContract
  };
};
