
import { useState } from 'react';
import { DocumentMetadata, AnalysisProgress, DocumentHighlight } from '@/types/contract';

export const useContractAnalysisState = () => {
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState<string>('');
  const [customSummary, setCustomSummary] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: 'idle',
    progress: 0
  });
  const [documentHighlights, setDocumentHighlights] = useState<DocumentHighlight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = (stage: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress({
      stage,
      progress: 0,
      startTime: new Date()
    });
    setError(null);
  };

  const updateAnalysisProgress = (progress: number, message?: string) => {
    setAnalysisProgress(prev => ({
      ...prev,
      progress,
      message
    }));
  };

  const completeAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisProgress({
      stage: 'completed',
      progress: 100
    });
  };

  const failAnalysis = (errorMessage: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
    setAnalysisProgress({
      stage: 'error',
      progress: 0
    });
  };

  return {
    // State
    documentMetadata,
    contractText,
    customSummary,
    isAnalyzing,
    analysisProgress,
    documentHighlights,
    error,
    
    // Setters
    setDocumentMetadata,
    setContractText,
    setCustomSummary,
    setDocumentHighlights,
    setError,
    
    // Analysis control
    startAnalysis,
    updateAnalysisProgress,
    completeAnalysis,
    failAnalysis
  };
};
