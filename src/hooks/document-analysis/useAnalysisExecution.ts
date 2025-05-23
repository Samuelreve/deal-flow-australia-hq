
import { useState, useCallback } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { AnalysisRequest, AnalysisResult, AnalysisProgress } from './types';
import { toast } from 'sonner';

export const useAnalysisExecution = (dealId: string) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});

  const { 
    analyzeDocument, 
    summarizeContract, 
    loading: aiLoading,
    error: aiError,
    saveAnalysisResult
  } = useDocumentAI({ dealId });

  const executeAnalysis = useCallback(async (request: AnalysisRequest): Promise<AnalysisResult | null> => {
    const { documentId, versionId, analysisType, saveToHistory = true } = request;
    
    setCurrentAnalysis(analysisType);
    setAnalysisProgress({
      stage: 'initializing',
      progress: 0,
      message: 'Starting analysis...',
      startTime: new Date()
    });

    try {
      // Simulate progress updates
      const progressTimer = setInterval(() => {
        setAnalysisProgress(prev => {
          if (!prev || prev.progress >= 90) return prev;
          return {
            ...prev,
            progress: Math.min(90, prev.progress + Math.random() * 15 + 5),
            stage: prev.progress < 30 ? 'processing' : prev.progress < 60 ? 'analyzing' : 'finalizing'
          };
        });
      }, 1000);

      let result;
      
      if (analysisType === 'summarize_contract') {
        result = await summarizeContract(documentId, versionId);
      } else {
        result = await analyzeDocument(documentId, versionId, analysisType);
      }

      clearInterval(progressTimer);
      setAnalysisProgress(prev => prev ? { ...prev, progress: 100, stage: 'complete' } : null);

      if (result) {
        const analysisResult: AnalysisResult = {
          type: analysisType,
          content: result.analysis?.content || result.summary || result,
          disclaimer: result.disclaimer,
          timestamp: new Date(),
          success: true
        };

        // Store result in state
        setAnalysisResults(prev => ({
          ...prev,
          [analysisType]: analysisResult
        }));

        // Save to history if requested
        if (saveToHistory && saveAnalysisResult) {
          try {
            await saveAnalysisResult(analysisType, analysisResult.content, documentId, versionId);
          } catch (saveError) {
            console.warn('Failed to save analysis to history:', saveError);
          }
        }

        toast.success('Analysis completed successfully');
        return analysisResult;
      }

      throw new Error('No result returned from analysis');

    } catch (error) {
      console.error('Analysis execution failed:', error);
      const errorResult: AnalysisResult = {
        type: analysisType,
        content: null,
        timestamp: new Date(),
        success: false
      };
      
      setAnalysisResults(prev => ({
        ...prev,
        [analysisType]: errorResult
      }));

      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setCurrentAnalysis(null);
      setTimeout(() => setAnalysisProgress(null), 2000);
    }
  }, [analyzeDocument, summarizeContract, saveAnalysisResult, dealId]);

  const getAnalysisResult = useCallback((analysisType: string) => {
    return analysisResults[analysisType] || null;
  }, [analysisResults]);

  const clearAnalysisResult = useCallback((analysisType: string) => {
    setAnalysisResults(prev => {
      const { [analysisType]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllResults = useCallback(() => {
    setAnalysisResults({});
  }, []);

  return {
    // State
    currentAnalysis,
    analysisProgress,
    analysisResults,
    isAnalyzing: !!currentAnalysis || aiLoading,
    analysisError: aiError,

    // Actions
    executeAnalysis,
    getAnalysisResult,
    clearAnalysisResult,
    clearAllResults
  };
};
