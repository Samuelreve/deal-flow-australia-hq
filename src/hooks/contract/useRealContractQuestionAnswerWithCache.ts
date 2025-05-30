
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  sources?: string[];
}

export const useRealContractQuestionAnswerWithCache = (contractId: string | null) => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cache, setCache] = useState<Map<string, string>>(new Map());

  console.log('🔧 useRealContractQuestionAnswerWithCache initialized:', { contractId });

  // Generate cache key for questions
  const getCacheKey = useCallback((question: string, contractId: string) => {
    return `${contractId}-${question.toLowerCase().trim()}`;
  }, []);

  // Handle asking questions about the contract
  const handleAskQuestion = useCallback(async (question: string, contractText: string) => {
    if (!contractId) {
      toast.error('No contract selected');
      return null;
    }

    if (!question.trim()) {
      toast.error('Please enter a question');
      return null;
    }

    if (!contractText.trim()) {
      toast.error('No contract content available for analysis');
      return null;
    }

    console.log('❓ Processing question:', question, 'for contract:', contractId);

    // Check cache first
    const cacheKey = getCacheKey(question, contractId);
    const cachedAnswer = cache.get(cacheKey);
    
    if (cachedAnswer) {
      console.log('💾 Using cached answer for question');
      const cachedItem: QuestionHistoryItem = {
        id: Date.now().toString(),
        question,
        answer: cachedAnswer,
        timestamp: new Date(),
        sources: ['Cached Response']
      };
      
      setQuestionHistory(prev => [cachedItem, ...prev]);
      return cachedItem;
    }

    setIsProcessing(true);
    
    try {
      console.log('🤖 Calling contract-assistant edge function...');
      
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question: question,
          contractText: contractText,
          contractId: contractId
        }
      });

      if (error) {
        console.error('❌ Contract assistant error:', error);
        throw new Error(error.message || 'Failed to process question');
      }

      if (!data || !data.answer) {
        console.error('❌ No answer received from contract assistant');
        throw new Error('No answer received from AI service');
      }

      console.log('✅ Received answer from contract assistant:', data.answer.substring(0, 100) + '...');

      const historyItem: QuestionHistoryItem = {
        id: Date.now().toString(),
        question,
        answer: data.answer,
        timestamp: new Date(),
        sources: data.sources || ['AI Analysis']
      };

      // Cache the answer
      setCache(prev => new Map(prev).set(cacheKey, data.answer));
      
      // Add to history
      setQuestionHistory(prev => [historyItem, ...prev]);
      
      toast.success('Question answered successfully');
      return historyItem;

    } catch (error) {
      console.error('❌ Error processing question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process question';
      toast.error('Failed to answer question', {
        description: errorMessage
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId, cache, getCacheKey]);

  // Handle contract analysis (like summarization)
  const handleAnalyzeContract = useCallback(async (analysisType: string, contractText: string) => {
    if (!contractId) {
      toast.error('No contract selected');
      return null;
    }

    if (!contractText.trim()) {
      toast.error('No contract content available for analysis');
      return null;
    }

    console.log('🔍 Processing analysis:', analysisType, 'for contract:', contractId);

    // Check cache for analysis
    const cacheKey = getCacheKey(analysisType, contractId);
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      console.log('💾 Using cached analysis result');
      try {
        return JSON.parse(cachedResult);
      } catch {
        // If parsing fails, proceed with new analysis
      }
    }

    setIsProcessing(true);
    
    try {
      let question = '';
      
      switch (analysisType) {
        case 'summary':
        case 'summarize':
          question = 'Please provide a comprehensive summary of this contract, including key terms, obligations, and important dates.';
          break;
        case 'key_terms':
          question = 'What are the key terms and conditions in this contract?';
          break;
        case 'risks':
        case 'risk_analysis':
          question = 'What are the potential risks and liabilities in this contract?';
          break;
        case 'obligations':
          question = 'What are the main obligations and responsibilities for each party in this contract?';
          break;
        default:
          question = `Please analyze this contract for: ${analysisType}`;
      }

      console.log('🤖 Calling contract-assistant for analysis with question:', question);
      
      const { data, error } = await supabase.functions.invoke('contract-assistant', {
        body: {
          question: question,
          contractText: contractText,
          contractId: contractId
        }
      });

      if (error) {
        console.error('❌ Contract analysis error:', error);
        throw new Error(error.message || 'Failed to analyze contract');
      }

      if (!data || !data.answer) {
        console.error('❌ No analysis result received');
        throw new Error('No analysis result received from AI service');
      }

      console.log('✅ Received analysis result:', data.answer.substring(0, 100) + '...');

      const analysisResult = {
        type: analysisType,
        content: data.answer,
        sources: data.sources || ['AI Analysis'],
        timestamp: new Date()
      };

      // Cache the result
      setCache(prev => new Map(prev).set(cacheKey, JSON.stringify(analysisResult)));
      
      // Add to history as a question
      const historyItem: QuestionHistoryItem = {
        id: Date.now().toString(),
        question: `Analysis: ${analysisType}`,
        answer: data.answer,
        timestamp: new Date(),
        sources: data.sources || ['AI Analysis']
      };
      
      setQuestionHistory(prev => [historyItem, ...prev]);
      
      toast.success(`${analysisType} analysis completed`);
      return analysisResult;

    } catch (error) {
      console.error('❌ Error analyzing contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze contract';
      toast.error('Analysis failed', {
        description: errorMessage
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId, cache, getCacheKey]);

  // Invalidate cache when contract changes
  const invalidateCache = useCallback(() => {
    console.log('🗑️ Invalidating cache for contract:', contractId);
    setCache(new Map());
    setQuestionHistory([]);
  }, [contractId]);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    invalidateCache
  }), [questionHistory, isProcessing, handleAskQuestion, handleAnalyzeContract, invalidateCache]);

  return returnValue;
};
