
import { useState, useCallback } from 'react';
import { ContractAnalysisState, DocumentMetadata, DocumentHighlight, AnalysisProgress } from '@/types/contract';

export const useContractAnalysisState = () => {
  const [state, setState] = useState<ContractAnalysisState>({
    documentMetadata: null,
    contractText: '',
    customSummary: null,
    isAnalyzing: false,
    analysisProgress: { stage: '', progress: 0 },
    documentHighlights: [],
    error: null
  });

  const setDocumentMetadata = useCallback((metadata: DocumentMetadata) => {
    setState(prev => ({ ...prev, documentMetadata: metadata, error: null }));
  }, []);

  const setContractText = useCallback((text: string) => {
    setState(prev => ({ ...prev, contractText: text }));
  }, []);

  const setCustomSummary = useCallback((summary: any) => {
    setState(prev => ({ ...prev, customSummary: summary }));
  }, []);

  const setIsAnalyzing = useCallback((analyzing: boolean) => {
    setState(prev => ({ ...prev, isAnalyzing: analyzing }));
  }, []);

  const setAnalysisProgress = useCallback((progress: AnalysisProgress) => {
    setState(prev => ({ ...prev, analysisProgress: progress }));
  }, []);

  const setDocumentHighlights = useCallback((highlights: DocumentHighlight[]) => {
    setState(prev => ({ ...prev, documentHighlights: highlights }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      documentMetadata: null,
      contractText: '',
      customSummary: null,
      isAnalyzing: false,
      analysisProgress: { stage: '', progress: 0 },
      documentHighlights: [],
      error: null
    });
  }, []);

  return {
    ...state,
    setDocumentMetadata,
    setContractText,
    setCustomSummary,
    setIsAnalyzing,
    setAnalysisProgress,
    setDocumentHighlights,
    setError,
    resetState
  };
};
