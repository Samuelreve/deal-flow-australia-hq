
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DocumentMetadata, SummaryData } from './types';
import { useQuestionAnswering } from './useQuestionAnswering';
import { useFileProcessing } from './useFileProcessing';
import { useHighlightManagement } from './useHighlightManagement';

/**
 * Main hook for contract analysis features - now uses real AI services only
 */
export const useContractAnalysis = () => {
  // Document metadata state
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  
  // Contract text state
  const [contractText, setContractText] = useState('');
  
  // Summary state
  const [customSummary, setCustomSummary] = useState<SummaryData | null>(null);
  
  // Get URL search params
  const [searchParams] = useSearchParams();
  
  // Get file processing functionality
  const {
    isAnalyzing,
    analysisStage,
    analysisProgress,
    error,
    setError,
    handleFileUpload: processFileUpload
  } = useFileProcessing();

  // Get highlight management functionality
  const {
    documentHighlights,
    setDocumentHighlights,
    exportHighlightsToCSV
  } = useHighlightManagement();
  
  // Get question answering functionality
  const {
    questionHistory,
    handleAskQuestion,
    isProcessing
  } = useQuestionAnswering();

  // Wrapper for file upload that updates local state
  const handleFileUpload = async (file: File) => {
    const result = await processFileUpload(file);
    
    if (result.success && result.metadata && result.text && result.summary) {
      setDocumentMetadata(result.metadata);
      setContractText(result.text);
      setCustomSummary(result.summary);
    }
  };

  useEffect(() => {
    // Check URL parameters to see if we should show analysis prompt
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    if (shouldAnalyze && !documentMetadata) {
      toast.info("Upload a contract to begin AI analysis", {
        description: "Please upload a document to start contract analysis"
      });
    }
  }, [searchParams, documentMetadata]);
  
  return {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary: null, // Remove mock summary
    isAnalyzing,
    analysisStage,
    analysisProgress,
    questionHistory,
    isProcessing,
    documentHighlights,
    error,
    setDocumentMetadata,
    setContractText,
    setCustomSummary,
    setDocumentHighlights,
    setError,
    exportHighlightsToCSV,
    handleFileUpload,
    handleAskQuestion
  };
};
