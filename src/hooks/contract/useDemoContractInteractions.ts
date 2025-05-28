
import { useCallback } from 'react';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { toast } from 'sonner';

export const useDemoContractInteractions = () => {
  const handleAnalyzeContract = useCallback(async (
    analysisType: string,
    setQuestionHistory: React.Dispatch<React.SetStateAction<QuestionHistoryItem[]>>
  ) => {
    console.log('Real contract analysis requested:', analysisType);
    
    // Don't provide mock analysis - require real contract upload
    toast.error('No contract available for analysis', {
      description: 'Please upload a contract document first to enable AI analysis.'
    });
    
    return null;
  }, []);

  return {
    handleAnalyzeContract
  };
};
