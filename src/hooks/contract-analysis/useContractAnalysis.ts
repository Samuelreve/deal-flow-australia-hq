
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DocumentMetadata, SummaryData } from './types';
import { mockDocumentMetadata, mockSummaryData, sampleContractText } from './mockData';
import { useAnalysisSimulation } from './useAnalysisSimulation';
import { useQuestionAnswering } from './useQuestionAnswering';

/**
 * Main hook for contract analysis features
 */
export const useContractAnalysis = () => {
  // Document metadata state
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>(mockDocumentMetadata);
  
  // Contract text state
  const [contractText, setContractText] = useState(sampleContractText);
  
  // Summary state
  const [customSummary, setCustomSummary] = useState<SummaryData | null>(null);
  
  // Get URL search params
  const [searchParams] = useSearchParams();
  
  // Get analysis simulation functionality
  const {
    isAnalyzing,
    analysisStage,
    analysisProgress,
    handleFileUpload,
  } = useAnalysisSimulation({
    documentMetadata,
    setDocumentMetadata,
    setContractText,
    setCustomSummary,
    mockSummaryData
  });
  
  // Get question answering functionality
  const {
    questionHistory,
    handleAskQuestion
  } = useQuestionAnswering();
  
  useEffect(() => {
    // Check URL parameters to see if we should auto-analyze
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    if (shouldAnalyze && !isAnalyzing) {
      // Simulate AI analysis delay
      toast.success("Contract analyzed successfully", {
        description: "AI summary and insights are now available"
      });
    }
  }, [searchParams, isAnalyzing]);
  
  return {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary: mockSummaryData,
    isAnalyzing,
    analysisStage,
    analysisProgress,
    questionHistory,
    handleFileUpload,
    handleAskQuestion
  };
};
