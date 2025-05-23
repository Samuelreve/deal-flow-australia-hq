
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DocumentMetadata, DocumentHighlight, AnalysisProgress } from '@/types/contract';

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
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState<string>('');
  const [customSummary, setCustomSummary] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentHighlights, setDocumentHighlights] = useState<DocumentHighlight[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({ 
    stage: '', 
    progress: 0 
  });

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
    } catch (error: any) {
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

  // Helper function to ensure DocumentMetadata has the correct status type
  const updateDocumentMetadata = (metadata: any): void => {
    if (!metadata) {
      setDocumentMetadata(null);
      return;
    }
    
    // Ensure status is one of the allowed values
    let status: 'pending' | 'analyzing' | 'completed' | 'error' = 'pending';
    if (metadata.status) {
      if (['pending', 'analyzing', 'completed', 'error'].includes(metadata.status)) {
        status = metadata.status as 'pending' | 'analyzing' | 'completed' | 'error';
      } else if (metadata.status === 'processing') {
        status = 'analyzing';
      }
    }
    
    setDocumentMetadata({
      id: metadata.id || '',
      name: metadata.name || 'Untitled Document',
      type: metadata.type || 'contract',
      uploadDate: metadata.uploadDate || new Date().toISOString(),
      status: status,
      version: metadata.version || '1.0',
      versionDate: metadata.versionDate || new Date().toISOString(),
      size: metadata.size || 0,
      category: metadata.category || 'legal'
    });
  };

  // Helper function to ensure highlights have the correct properties
  const updateDocumentHighlights = (highlights: any[]): void => {
    if (!Array.isArray(highlights)) {
      setDocumentHighlights([]);
      return;
    }
    
    const formattedHighlights: DocumentHighlight[] = highlights.map(highlight => ({
      id: highlight.id || '',
      text: highlight.text || '',
      startIndex: highlight.startIndex || 0,
      endIndex: highlight.endIndex || 0,
      color: highlight.color || '#ffcc00',
      category: highlight.category || 'custom',
      note: highlight.note || '',
      createdAt: highlight.createdAt || new Date().toISOString()
    }));
    
    setDocumentHighlights(formattedHighlights);
  };

  return {
    requestAnalysis,
    getAnalysisState,
    analysisState,
    documentMetadata,
    setDocumentMetadata: updateDocumentMetadata,
    contractText,
    setContractText,
    customSummary,
    setCustomSummary,
    isAnalyzing,
    documentHighlights,
    setDocumentHighlights: updateDocumentHighlights,
    analysisProgress,
    setAnalysisProgress,
    setError: (error: string) => console.error('Analysis error:', error)
  };
};

export default useContractAnalysisState;
