import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';
import { Contract } from '@/services/realContractService';

interface UseEnhancedContractAssistantProps {
  dealId?: string;
  documentId?: string;
  versionId?: string;
  contract?: Contract; // Use proper Contract type
}

export const useEnhancedContractAssistant = ({
  dealId,
  documentId,
  versionId,
  contract
}: UseEnhancedContractAssistantProps) => {
  const { user } = useAuth();
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🤖 useEnhancedContractAssistant initialized:', {
    dealId,
    documentId,
    versionId,
    hasContract: !!contract,
    contractId: contract?.id,
    contractContentLength: contract?.content?.length || 0,
    userId: user?.id
  });

  // Ask a question about the contract using legacy format
  const askQuestion = useCallback(async (question: string) => {
    if (!contract?.content) {
      console.error('❌ No contract content available for question');
      toast.error('Contract content not available');
      return null;
    }

    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('Please log in to ask questions');
      return null;
    }

    console.log('❓ Asking question using legacy format:', {
      question: question.substring(0, 100),
      contractId: contract.id,
      contentLength: contract.content.length
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
      // Use legacy format for standalone contracts
      const { data, error: functionError } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question: question,
          contractText: contract.content,
          contractId: contract.id
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
  }, [contract, user]);

  // Summarize contract terms using legacy format
  const summarizeContractTerms = useCallback(async () => {
    if (!contract?.content) {
      console.error('❌ No contract content available for summarization');
      toast.error('Contract content not available');
      return null;
    }

    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('Please log in to generate summary');
      return null;
    }

    console.log('📄 Summarizing contract terms using legacy format:', {
      contractId: contract.id,
      contentLength: contract.content.length
    });

    try {
      // Use legacy format with summary question
      const summaryQuestion = 'Please provide a comprehensive summary of this contract, highlighting the key terms, parties involved, main obligations, financial terms, important dates, termination conditions, and risk factors.';
      
      const { data, error: functionError } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question: summaryQuestion,
          contractText: contract.content,
          contractId: contract.id
        }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Failed to generate summary');
      }

      if (!data?.answer) {
        console.error('❌ No analysis received:', data);
        throw new Error('No analysis received from AI service');
      }

      console.log('✅ Summary generated successfully');

      // Add summary to history as an analysis item
      const summaryItem: QuestionHistoryItem = {
        id: `summary-${Date.now()}`,
        question: 'Contract Summary',
        answer: data.answer,
        timestamp: new Date(),
        type: 'analysis',
        analysisType: 'summary',
        sources: data.sources || []
      };

      setQuestionHistory(prev => [summaryItem, ...prev]);

      return {
        analysis: data.answer,
        sources: data.sources || []
      };

    } catch (error) {
      console.error('❌ Error generating summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setError(errorMessage);
      throw error;
    }
  }, [contract, user]);

  // Analyze contract with specific analysis type using legacy format
  const analyzeContract = useCallback(async (analysisType: string) => {
    console.log('🔍 Analyzing contract using legacy format:', { 
      analysisType, 
      contractId: contract?.id,
      contentLength: contract?.content?.length || 0
    });

    if (analysisType === 'comprehensive_summary' || analysisType === 'contract_summary') {
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
  }, [askQuestion, summarizeContractTerms, contract]);

  return {
    questionHistory,
    isProcessing,
    error,
    askQuestion,
    summarizeContractTerms,
    analyzeContract
  };
};
