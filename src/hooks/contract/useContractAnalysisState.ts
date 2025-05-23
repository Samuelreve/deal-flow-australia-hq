
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalysisState {
  loading: boolean;
  result: any;
  error: string | null;
}

interface AnalysisRequest {
  documentId: string;
  analysisType: string;
}

export const useContractAnalysisState = () => {
  const [analysisState, setAnalysisState] = useState<Record<string, AnalysisState>>({});

  const requestAnalysis = async (request: AnalysisRequest) => {
    const { documentId, analysisType } = request;
    const analysisKey = `${documentId}-${analysisType}`;
    
    // Set loading state
    setAnalysisState(prev => ({
      ...prev,
      [analysisKey]: { loading: true, result: null, error: null }
    }));
    
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
    }
  };

  const getAnalysisState = (documentId: string, analysisType: string) => {
    const analysisKey = `${documentId}-${analysisType}`;
    return analysisState[analysisKey] || { loading: false, result: null, error: null };
  };

  return {
    requestAnalysis,
    getAnalysisState,
    analysisState
  };
};

export default useContractAnalysisState;
