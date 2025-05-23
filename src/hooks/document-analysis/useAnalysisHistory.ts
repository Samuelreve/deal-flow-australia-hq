
import { useState, useCallback, useEffect } from 'react';
import { documentAnalysisService } from '@/services/documentAnalysisService';
import { AnalysisHistory } from './types';

export const useAnalysisHistory = (documentId?: string, versionId?: string) => {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (docId?: string, verId?: string) => {
    const targetDocId = docId || documentId;
    const targetVerId = verId || versionId;
    
    if (!targetDocId) return;

    setLoading(true);
    setError(null);

    try {
      let historyData;
      if (targetVerId) {
        historyData = await documentAnalysisService.getVersionAnalysisHistory(targetVerId);
      } else {
        historyData = await documentAnalysisService.getAnalysisHistory(targetDocId);
      }
      
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load analysis history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [documentId, versionId]);

  const refreshHistory = useCallback(() => {
    loadHistory();
  }, [loadHistory]);

  const getHistoryByType = useCallback((analysisType: string) => {
    return history.filter(item => item.analysisType === analysisType);
  }, [history]);

  // Auto-load history when documentId or versionId changes
  useEffect(() => {
    if (documentId) {
      loadHistory();
    }
  }, [documentId, versionId, loadHistory]);

  return {
    history,
    loading,
    error,
    loadHistory,
    refreshHistory,
    getHistoryByType
  };
};
