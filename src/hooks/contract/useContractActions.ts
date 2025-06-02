
import { useCallback } from 'react';
import { Contract } from '@/services/realContractService';
import { useRealContractQuestionAnswerWithCache } from './useRealContractQuestionAnswerWithCache';
import { toast } from 'sonner';

export const useContractActions = (selectedContract: Contract | null) => {
  const questionAnswerState = useRealContractQuestionAnswerWithCache(selectedContract?.id || null);

  // Handle question submission
  const handleAskQuestion = useCallback(async (question: string) => {
    console.log('❓ Question asked:', question);
    
    if (!selectedContract?.content) {
      console.log('❌ No contract content available for analysis');
      toast.error('No contract content available for analysis');
      return null;
    }

    console.log('📝 Processing question with contract:', {
      contractId: selectedContract.id,
      contentLength: selectedContract.content.length,
      questionLength: question.length
    });

    const result = await questionAnswerState.handleAskQuestion(question, selectedContract.content);
    
    if (result) {
      console.log('✅ Question processed successfully');
      const answerText = typeof result.answer === 'string' 
        ? result.answer 
        : typeof result.answer === 'object' && result.answer !== null
        ? result.answer.answer
        : 'No response available';
      
      const sources = typeof result.answer === 'object' && result.answer !== null && result.answer.sources
        ? result.answer.sources
        : result.sources || [];

      return {
        answer: answerText,
        sources: sources
      };
    }
    
    console.log('❌ Question processing failed');
    return null;
  }, [selectedContract, questionAnswerState]);

  // Handle contract analysis
  const handleAnalyzeContract = useCallback(async (analysisType: string) => {
    console.log('🔍 Analysis requested:', analysisType);
    
    if (!selectedContract?.content) {
      console.log('❌ No contract content available for analysis');
      toast.error('No contract content available for analysis');
      return null;
    }

    console.log('📝 Processing analysis with contract:', {
      contractId: selectedContract.id,
      contentLength: selectedContract.content.length,
      analysisType
    });

    const result = await questionAnswerState.handleAnalyzeContract(analysisType, selectedContract.content);
    
    if (result && result.content) {
      console.log('✅ Analysis completed successfully');
      return {
        analysis: result.content,
        sources: result.sources || []
      };
    }
    
    console.log('❌ Analysis failed');
    return null;
  }, [selectedContract, questionAnswerState]);

  const handleRetryAnalysis = useCallback(() => {
    console.log('🔄 Retry analysis');
    questionAnswerState.invalidateCache();
  }, [questionAnswerState]);

  return {
    questionHistory: questionAnswerState.questionHistory,
    isProcessing: questionAnswerState.isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    handleRetryAnalysis
  };
};
