
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useCachedAnalysis } from '@/hooks/contract/useCachedAnalysis';

interface QuestionHistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

export const useRealContractQuestionAnswerWithCache = (contractId: string | null) => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    getCachedResult, 
    setCachedResult, 
    invalidateCache 
  } = useCachedAnalysis({ cacheTimeout: 600000 }); // 10 minutes cache

  // Clear history when contract changes
  useEffect(() => {
    setQuestionHistory([]);
  }, [contractId]);

  const handleAskQuestion = useCallback(async (question: string, contractContent: string) => {
    if (!contractId) return null;
    
    // Check cache first
    const cachedResult = getCachedResult(contractId, 'question', { question });
    
    if (cachedResult) {
      setQuestionHistory(prev => [
        ...prev,
        {
          question,
          answer: cachedResult.answer,
          timestamp: Date.now(),
          type: 'question'
        }
      ]);
      return cachedResult;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - in a real app, this would call an AI service
      const answer = `This is a simulated answer to your question: "${question}"`;
      
      const result = { question, answer };
      
      // Store in cache
      setCachedResult(contractId, 'question', result, { question });
      
      setQuestionHistory(prev => [
        ...prev,
        {
          question,
          answer,
          timestamp: Date.now(),
          type: 'question'
        }
      ]);
      
      return result;
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to process your question');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId, getCachedResult, setCachedResult]);

  const handleAnalyzeContract = useCallback(async (analysisType: string, contractContent: string) => {
    if (!contractId) return null;
    
    // Check cache first
    const cachedResult = getCachedResult(contractId, analysisType);
    
    if (cachedResult) {
      setQuestionHistory(prev => [
        ...prev,
        {
          question: `Analyze contract: ${analysisType}`,
          answer: cachedResult.analysis,
          timestamp: Date.now(),
          type: 'analysis',
          analysisType
        }
      ]);
      return cachedResult;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - in a real app, this would call an AI service
      const analysis = `This is a simulated ${analysisType} analysis of your contract.`;
      
      const result = { analysisType, analysis };
      
      // Store in cache
      setCachedResult(contractId, analysisType, result);
      
      setQuestionHistory(prev => [
        ...prev,
        {
          question: `Analyze contract: ${analysisType}`,
          answer: analysis,
          timestamp: Date.now(),
          type: 'analysis',
          analysisType
        }
      ]);
      
      return result;
    } catch (error) {
      console.error(`Error analyzing contract (${analysisType}):`, error);
      toast.error(`Failed to analyze contract: ${analysisType}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId, getCachedResult, setCachedResult]);

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    clearHistory: () => setQuestionHistory([]),
    invalidateCache: () => invalidateCache(contractId)
  };
};
