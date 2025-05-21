
import { useState, useCallback, useEffect } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { getAnalysisLabel } from './constants';

export const useAnalysisState = (dealId: string, documentId: string, versionId: string) => {
  const [activeTab, setActiveTab] = useState<string>('summarize_contract');
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [analysisInProgress, setAnalysisInProgress] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  
  const { 
    analyzeDocument, 
    summarizeContract,
    loading: aiLoading, 
    error: aiError 
  } = useDocumentAI({ dealId });

  // Function to run analysis for a specific type
  const runAnalysis = useCallback(async (analysisType: string) => {
    if (aiLoading || analysisInProgress) return;
    
    setAnalysisInProgress(analysisType);
    setAnalysisStartTime(new Date());
    setAnalysisProgress(0);
    
    try {
      let result;
      
      // Use a progress timer to simulate progress
      const progressTimer = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 10 + 5;
          return Math.min(90, prev + increment);
        });
      }, 800);
      
      // Run the appropriate analysis based on type
      if (analysisType === 'summarize_contract') {
        result = await summarizeContract(documentId, versionId);
      } else {
        result = await analyzeDocument(documentId, versionId, analysisType);
      }
      
      // Clear timer and set 100% progress
      clearInterval(progressTimer);
      setAnalysisProgress(100);
      
      // Update results with the new analysis
      setAnalysisResults(prev => ({
        ...prev,
        [analysisType]: result
      }));
      
    } catch (error) {
      console.error(`Error analyzing document for ${analysisType}:`, error);
    } finally {
      setAnalysisInProgress(null);
    }
  }, [dealId, documentId, versionId, aiLoading, analysisInProgress, analyzeDocument, summarizeContract]);

  // Function to handle tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    
    // If we don't have results for this tab yet, run the analysis
    if (!analysisResults[value] && !analysisInProgress) {
      runAnalysis(value);
    }
  }, [analysisResults, analysisInProgress, runAnalysis]);

  return {
    activeTab,
    analysisResults,
    analysisInProgress,
    analysisProgress,
    analysisStartTime,
    aiLoading,
    aiError,
    runAnalysis,
    handleTabChange,
  };
};
