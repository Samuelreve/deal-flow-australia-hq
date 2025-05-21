
import { useState, useEffect } from 'react';
import { useDocumentAI } from '@/hooks/document-ai';

export const useAnalysisState = (dealId: string, documentId: string, versionId: string) => {
  const [activeTab, setActiveTab] = useState('summarize_contract');
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [analysisInProgress, setAnalysisInProgress] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);

  // Initialize document AI hook
  const {
    analyzeDocument,
    summarizeContract,
    loading: aiLoading,
    error: aiError
  } = useDocumentAI({ dealId, documentId });

  // Simulate progress updates during analysis
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (analysisInProgress) {
      setAnalysisProgress(0);
      setAnalysisStartTime(new Date());
      
      progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Gradually increase progress but never reach 100% until analysis is complete
          const newProgress = prev + (100 - prev) * 0.1;
          return Math.min(newProgress, 95);
        });
      }, 500);
    } else if (analysisProgress > 0 && analysisProgress < 100) {
      // Set to 100% when analysis is complete
      setAnalysisProgress(100);
      
      // Reset progress after a delay
      const resetTimeout = setTimeout(() => {
        setAnalysisProgress(0);
      }, 1000);
      
      return () => clearTimeout(resetTimeout);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [analysisInProgress, analysisProgress]);

  const runAnalysis = async (analysisType: string) => {
    if (analysisInProgress || analysisResults[analysisType]) return;
    
    setAnalysisInProgress(analysisType);
    
    try {
      let result;
      if (analysisType === 'summarize_contract') {
        result = await summarizeContract(documentId, versionId);
        if (result) {
          setAnalysisResults(prev => ({
            ...prev,
            [analysisType]: {
              type: analysisType,
              content: { summary: result.summary }
            }
          }));
        }
      } else {
        result = await analyzeDocument(documentId, versionId, analysisType);
        if (result) {
          setAnalysisResults(prev => ({
            ...prev,
            [analysisType]: result.analysis
          }));
        }
      }
    } catch (error) {
      console.error(`Error running ${analysisType} analysis:`, error);
    } finally {
      setAnalysisInProgress(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (!analysisResults[value]) {
      runAnalysis(value);
    }
  };

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
    setActiveTab,
  };
};
