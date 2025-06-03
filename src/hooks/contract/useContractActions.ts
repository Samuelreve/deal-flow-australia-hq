
import { useCallback } from 'react';
import { Contract } from '@/hooks/contract/useRealContracts';
import { useEnhancedContractAssistant } from './useEnhancedContractAssistant';
import { toast } from 'sonner';

export const useContractActions = (selectedContract: Contract | null) => {
  console.log('🔧 useContractActions initialized with contract:', {
    contractId: selectedContract?.id,
    hasContent: !!selectedContract?.content,
    contentLength: selectedContract?.content?.length || 0
  });

  // Initialize the enhanced contract assistant
  const contractAssistant = useEnhancedContractAssistant({
    dealId: 'demo-deal', // Use demo deal ID for standalone contracts
    documentId: selectedContract?.id || '',
    versionId: selectedContract?.id || '' // Use same ID for version
  });

  // Handle question submission
  const handleAskQuestion = useCallback(async (question: string) => {
    console.log('❓ Question asked:', question);
    
    if (!selectedContract?.content) {
      console.log('❌ No contract content available for analysis');
      toast.error('No contract content available for analysis');
      return null;
    }

    if (!selectedContract.id) {
      console.log('❌ No contract ID available');
      toast.error('Contract ID not available');
      return null;
    }

    console.log('📝 Processing question with contract:', {
      contractId: selectedContract.id,
      contentLength: selectedContract.content.length,
      questionLength: question.length
    });

    try {
      const result = await contractAssistant.askQuestion(question);
      
      if (result) {
        console.log('✅ Question processed successfully');
        return result;
      }
      
      console.log('❌ Question processing failed - no result');
      return null;
    } catch (error) {
      console.error('❌ Error in handleAskQuestion:', error);
      toast.error('Failed to process question: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    }
  }, [selectedContract, contractAssistant]);

  // Handle contract analysis
  const handleAnalyzeContract = useCallback(async (analysisType: string) => {
    console.log('🔍 Analysis requested:', analysisType);
    
    if (!selectedContract?.content) {
      console.log('❌ No contract content available for analysis');
      toast.error('No contract content available for analysis');
      return null;
    }

    if (!selectedContract.id) {
      console.log('❌ No contract ID available');
      toast.error('Contract ID not available');
      return null;
    }

    console.log('📝 Processing analysis with contract:', {
      contractId: selectedContract.id,
      contentLength: selectedContract.content.length,
      analysisType
    });

    try {
      const result = await contractAssistant.analyzeContract(analysisType);
      
      console.log('📥 Analysis result received:', {
        hasResult: !!result,
        hasAnalysis: !!(result?.analysis),
        analysisLength: result?.analysis?.length || 0,
        analysisType
      });
      
      if (result) {
        console.log('✅ Analysis completed successfully');
        return result;
      }
      
      console.log('❌ Analysis failed - no result');
      return null;
    } catch (error) {
      console.error('❌ Error in handleAnalyzeContract:', error);
      toast.error('Failed to complete analysis: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    }
  }, [selectedContract, contractAssistant]);

  const handleRetryAnalysis = useCallback(() => {
    console.log('🔄 Retry analysis requested');
    toast.info('Please try your analysis again');
  }, []);

  return {
    questionHistory: contractAssistant.questionHistory,
    isProcessing: contractAssistant.isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    handleRetryAnalysis
  };
};
