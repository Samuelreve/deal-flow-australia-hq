
import { useState } from 'react';
import { toast } from 'sonner';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useRealContractQuestionAnswerWithCache } from '@/hooks/contract/useRealContractQuestionAnswerWithCache';
import { useContractFocusManagement } from '@/components/contract/accessibility/EnhancedAccessibility';

export const useContractPageHandlers = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { announceToScreenReader } = useContractFocusManagement();
  
  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadContract,
    selectContract
  } = useRealContracts();

  const questionAnswerState = useRealContractQuestionAnswerWithCache(selectedContract?.id || null);

  // Handle file upload with enhanced UX
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadContract(file);
        toast.success('Contract uploaded successfully');
        announceToScreenReader(`Contract ${file.name} uploaded and analysis started`);
        setActiveTab('assistant');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload contract');
        announceToScreenReader('Contract upload failed');
      }
    }
  };

  const handleContractSelect = (contractId: string) => {
    selectContract(contractId);
    setActiveTab('assistant');
    announceToScreenReader('Contract selected and ready for analysis');
  };

  const handleAskQuestion = async (question: string) => {
    if (!selectedContract?.content) {
      throw new Error('No contract content available');
    }
    return await questionAnswerState.handleAskQuestion(question, selectedContract.content);
  };

  const handleAnalyzeContract = async (analysisType: string) => {
    if (!selectedContract?.content) {
      throw new Error('No contract content available');
    }
    return await questionAnswerState.handleAnalyzeContract(analysisType, selectedContract.content);
  };

  const handleRetryAnalysis = () => {
    if (selectedContract) {
      // Invalidate cache for this contract before retrying
      questionAnswerState.invalidateCache();
      selectContract(selectedContract.id);
      announceToScreenReader('Retrying contract analysis');
    }
  };

  return {
    activeTab,
    setActiveTab,
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    questionHistory: questionAnswerState.questionHistory,
    isProcessing: questionAnswerState.isProcessing,
    handleFileUpload,
    handleContractSelect,
    handleAskQuestion,
    handleAnalyzeContract,
    handleRetryAnalysis
  };
};
