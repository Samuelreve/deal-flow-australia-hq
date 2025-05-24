
import { useState } from 'react';
import { DocumentMetadata, DocumentHighlight, AnalysisProgress } from '@/types/contract';

export const useContractAnalysisState = () => {
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState('');
  const [customSummary, setCustomSummary] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: 'idle',
    progress: 0
  });
  const [documentHighlights, setDocumentHighlights] = useState<DocumentHighlight[]>([]);
  const [error, setError] = useState<string | null>(null);

  return {
    documentMetadata,
    setDocumentMetadata,
    contractText,
    setContractText,
    customSummary,
    setCustomSummary,
    isAnalyzing,
    setIsAnalyzing,
    analysisProgress,
    setAnalysisProgress,
    documentHighlights,
    setDocumentHighlights,
    error,
    setError
  };
};
