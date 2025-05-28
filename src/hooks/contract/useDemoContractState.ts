
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useContractAnalysisState } from '@/hooks/contract/useContractAnalysisState';
import { useContractQuestionAnswer } from '@/hooks/contract/useContractQuestionAnswer';

export const useDemoContractState = () => {
  const [searchParams] = useSearchParams();
  const analysisState = useContractAnalysisState();
  const questionAnswerState = useContractQuestionAnswer();
  
  useEffect(() => {
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    // Only initialize basic metadata, no mock content
    if (!analysisState.documentMetadata) {
      analysisState.setDocumentMetadata({
        id: 'demo-contract',
        name: 'Upload a contract to begin analysis',
        type: 'Contract',
        uploadDate: new Date().toISOString(),
        status: 'pending' as const,
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: 0,
        category: 'Legal Agreement'
      });
    }
    
    if (shouldAnalyze && !analysisState.isAnalyzing) {
      toast.info("Upload a contract to start AI analysis", {
        description: "Please upload a document to begin contract analysis",
        duration: 4000
      });
    }
  }, [searchParams, analysisState]);

  return {
    analysisState,
    questionAnswerState,
    sampleContractText: '' // Remove sample text
  };
};
