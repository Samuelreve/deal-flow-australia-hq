
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DocumentMetadata, SummaryData, Highlight } from './types';
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
  
  // User highlight preferences state
  const [documentHighlights, setDocumentHighlights] = useState<Highlight[]>([]);
  
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
    handleAskQuestion,
    isProcessing
  } = useQuestionAnswering();
  
  // Save highlights to local storage when they change
  useEffect(() => {
    if (documentHighlights.length > 0) {
      try {
        localStorage.setItem('contract-highlights', JSON.stringify(documentHighlights));
      } catch (error) {
        console.error('Error saving highlights to local storage:', error);
      }
    }
  }, [documentHighlights]);
  
  // Load highlights from local storage on initial load
  useEffect(() => {
    try {
      const savedHighlights = localStorage.getItem('contract-highlights');
      if (savedHighlights) {
        setDocumentHighlights(JSON.parse(savedHighlights));
      }
    } catch (error) {
      console.error('Error loading highlights from local storage:', error);
    }
  }, []);
  
  // Export highlights to CSV
  const exportHighlightsToCSV = useCallback(() => {
    if (documentHighlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }
    
    try {
      // Create CSV content
      const headers = ['Text', 'Category', 'Note', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...documentHighlights.map(highlight => {
          return [
            `"${highlight.text.replace(/"/g, '""')}"`,
            highlight.category,
            `"${(highlight.note || '').replace(/"/g, '""')}"`,
            new Date(highlight.createdAt).toLocaleString()
          ].join(',');
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contract-highlights-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Highlights exported successfully');
    } catch (error) {
      console.error('Error exporting highlights:', error);
      toast.error('Failed to export highlights');
    }
  }, [documentHighlights]);
  
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
    isProcessing,
    documentHighlights,
    setDocumentHighlights,
    exportHighlightsToCSV,
    handleFileUpload,
    handleAskQuestion
  };
};
