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

  const analyzeContract = useCallback(async (analysisType: string) => {
    console.log('🔍 Analyzing contract using enhanced format:', { 
      analysisType, 
      contractId: contract?.id,
      contentLength: contract?.content?.length || 0
    });

    if (!contract?.content) {
      console.error('❌ No contract content available for analysis');
      toast.error('Contract content not available');
      return null;
    }

    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('Please log in to perform analysis');
      return null;
    }

    // Map frontend analysis types to backend types
    const analysisTypeMap: { [key: string]: string } = {
      summary: 'summary',
      keyTerms: 'keyTerms', 
      risks: 'risks',
      suggestions: 'suggestions',
      comprehensive_summary: 'summary',
      contract_summary: 'summary',
      key_terms: 'keyTerms',
      risk_assessment: 'risks'
    };

    const backendAnalysisType = analysisTypeMap[analysisType] || analysisType;

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
    setIsProcessing(true);

    try {
      // Call the new summarization endpoint with analysis type
      const { data, error: functionError } = await supabase.functions.invoke('contract-assistant', {
        body: {
          requestType: 'summarize_contract_terms',
          dealId: 'demo-deal',
          documentId: contract.id,
          versionId: contract.id,
          analysisType: backendAnalysisType
        }
      });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message || 'Failed to complete analysis');
      }

      if (!data?.analysis) {
        console.error('❌ No analysis received:', data);
        throw new Error('No analysis received from AI service');
      }

      console.log('✅ Analysis completed successfully:', {
        analysisType: backendAnalysisType,
        analysisLength: data.analysis.length
      });

      // Update the analysis item with results
      const completedAnalysis: QuestionHistoryItem = {
        ...analysisItem,
        id: `analysis-${Date.now()}`,
        answer: data.analysis,
        sources: data.sources || ['AI Analysis', 'Contract Content Review'],
        isProcessing: false
      };

      setQuestionHistory(prev => 
        prev.map(item => item.id === tempId ? completedAnalysis : item)
      );

      return {
        analysis: data.analysis,
        sources: data.sources || ['AI Analysis', 'Contract Content Review'],
        analysisType: data.analysisType || backendAnalysisType
      };

    } catch (error) {
      console.error('❌ Error in contract analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete analysis';
      setError(errorMessage);

      // Update the analysis item with error state
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

  return {
    questionHistory,
    isProcessing,
    error,
    askQuestion,
    summarizeContractTerms,
    analyzeContract
  };
};
