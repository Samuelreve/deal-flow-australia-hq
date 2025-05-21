
import { useState } from 'react';
import { DocumentAnalysis, documentAnalysisService } from '@/services/documentAnalysisService';
import { useToast } from '@/components/ui/use-toast';

export interface UseDocumentAnalysisHistoryProps {
  documentId?: string;
  documentVersionId?: string;
}

/**
 * Hook for managing document analysis history
 */
export const useDocumentAnalysisHistory = ({ documentId, documentVersionId }: UseDocumentAnalysisHistoryProps) => {
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Load analysis history for a document
   */
  const loadAnalysisHistory = async (docId?: string) => {
    const targetDocId = docId || documentId;
    if (!targetDocId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const history = await documentAnalysisService.getAnalysisHistory(targetDocId);
      setAnalyses(history);
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis history');
      toast({
        title: "Error",
        description: "Failed to load analysis history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load analysis history for a specific version
   */
  const loadVersionAnalysisHistory = async (versionId?: string) => {
    const targetVersionId = versionId || documentVersionId;
    if (!targetVersionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const history = await documentAnalysisService.getVersionAnalysisHistory(targetVersionId);
      setAnalyses(history);
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis history');
      toast({
        title: "Error",
        description: "Failed to load version analysis history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a specific analysis by ID
   */
  const getAnalysisById = async (analysisId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await documentAnalysisService.getAnalysisById(analysisId);
      setSelectedAnalysis(analysis);
      return analysis;
    } catch (err: any) {
      setError(err.message || 'Failed to get analysis');
      toast({
        title: "Error",
        description: "Failed to get analysis details",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save a new analysis result
   */
  const saveAnalysisResult = async (analysisType: string, analysisContent: any, docId?: string, versionId?: string) => {
    const targetDocId = docId || documentId;
    const targetVersionId = versionId || documentVersionId;

    if (!targetDocId || !targetVersionId) {
      setError('Document ID and Version ID are required to save analysis');
      toast({
        title: "Error",
        description: "Document ID and Version ID are required to save analysis",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const savedAnalysis = await documentAnalysisService.saveAnalysis({
        documentId: targetDocId,
        documentVersionId: targetVersionId,
        analysisType,
        analysisContent
      });
      
      // Update the history list with the new analysis
      if (savedAnalysis) {
        setAnalyses(prev => [savedAnalysis, ...prev]);
        toast({
          title: "Analysis Saved",
          description: "Document analysis has been saved successfully"
        });
      }
      
      return savedAnalysis;
    } catch (err: any) {
      setError(err.message || 'Failed to save analysis');
      toast({
        title: "Error",
        description: "Failed to save analysis result",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    analyses,
    selectedAnalysis,
    loading,
    error,
    loadAnalysisHistory,
    loadVersionAnalysisHistory,
    getAnalysisById,
    saveAnalysisResult,
    setSelectedAnalysis
  };
};
