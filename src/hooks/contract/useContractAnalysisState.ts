
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DocumentMetadata } from '@/hooks/contract-analysis/types';

interface AnalysisState {
  loading: boolean;
  result: any;
  error: string | null;
}

interface AnalysisRequest {
  documentId: string;
  analysisType: string;
}

interface AnalysisProgress {
  stage: string;
  progress: number;
}

interface DocumentHighlight {
  id: string;
  text: string;
  category?: string;
  note?: string;
  createdAt: string;
}

export const useContractAnalysisState = () => {
  const [analysisState, setAnalysisState] = useState<Record<string, AnalysisState>>({});
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState<string>('');
  const [customSummary, setCustomSummary] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentHighlights, setDocumentHighlights] = useState<DocumentHighlight[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({ stage: '', progress: 0 });

  const requestAnalysis = async (request: AnalysisRequest) => {
    const { documentId, analysisType } = request;
    const analysisKey = `${documentId}-${analysisType}`;
    
    // Set loading state
    setAnalysisState(prev => ({
      ...prev,
      [analysisKey]: { loading: true, result: null, error: null }
    }));
    
    setIsAnalyzing(true);
    
    try {
      // Call the document-analysis edge function
      const { data, error } = await supabase.functions.invoke('document-analysis', {
        body: { documentId, analysisType }
      });
      
      if (error) throw error;
      
      // Update state with successful result
      setAnalysisState(prev => ({
        ...prev,
        [analysisKey]: { loading: false, result: data, error: null }
      }));
      
      toast.success(`${analysisType} analysis completed successfully`);
      return data;
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Update state with error
      setAnalysisState(prev => ({
        ...prev,
        [analysisKey]: { 
          loading: false, 
          result: null, 
          error: error.message || 'Failed to analyze document' 
        }
      }));
      
      toast.error(`Analysis failed: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisState = (documentId: string, analysisType: string) => {
    const analysisKey = `${documentId}-${analysisType}`;
    return analysisState[analysisKey] || { loading: false, result: null, error: null };
  };

  return {
    requestAnalysis,
    getAnalysisState,
    analysisState,
    documentMetadata,
    setDocumentMetadata,
    contractText,
    setContractText,
    customSummary,
    setCustomSummary,
    isAnalyzing,
    documentHighlights,
    analysisProgress,
    setError: (error: string) => console.error('Analysis error:', error)
  };
};

export default useContractAnalysisState;
