import { useCallback } from 'react';
import { Contract } from '@/services/realContractService';
import { useEnhancedContractAssistant } from './useEnhancedContractAssistant';
import { toast } from 'sonner';

export const useContractActions = (selectedContract: Contract | null) => {
  // Initialize the enhanced contract assistant with the contract object
  const contractAssistant = useEnhancedContractAssistant({
    dealId: 'demo-deal', // Use demo deal ID for standalone contracts
    documentId: selectedContract?.id || '',
    versionId: selectedContract?.id || '', // Use same ID for version
    contract: selectedContract // Pass the contract object for legacy format
  });

  // Handle question submission
  const handleAskQuestion = useCallback(async (question: string) => {
    if (!selectedContract?.content) {
      toast.error('No contract content available for analysis');
      return null;
    }

    if (!selectedContract.id) {
      toast.error('Contract ID not available');
      return null;
    }

    try {
      const result = await contractAssistant.askQuestion(question);
      return result || null;
    } catch (error) {
      console.error('Error in handleAskQuestion:', error);
      toast.error('Failed to process question: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    }
  }, [selectedContract, contractAssistant]);

  // Handle contract analysis
  const handleAnalyzeContract = useCallback(async (analysisType: string) => {
    if (!selectedContract?.content) {
      toast.error('No contract content available for analysis');
      return null;
    }

    if (!selectedContract.id) {
      toast.error('Contract ID not available');
      return null;
    }

    try {
      const result = await contractAssistant.analyzeContract(analysisType);
      return result || null;
    } catch (error) {
      console.error('Error in handleAnalyzeContract:', error);
      toast.error('Failed to complete analysis: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    }
  }, [selectedContract, contractAssistant]);

  const handleRetryAnalysis = useCallback(() => {
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
