
import { useState, useCallback } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { ContractClauseExplanationResponse } from '@/hooks/document-ai/types';

interface UseDocumentExplanationProps {
  dealId: string;
}

export function useDocumentExplanation({
  dealId,
}: UseDocumentExplanationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationResult, setExplanationResult] = useState<ContractClauseExplanationResponse | null>(null);

  const { explainClause } = useDocumentAI({ dealId });

  const handleExplainSelectedText = useCallback(async (selectedText: string | null) => {
    if (!selectedText) {
      setError('No text selected to explain');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await explainClause(selectedText);
      setExplanationResult(result);
    } catch (err: any) {
      console.error('Error explaining text:', err);
      setError(err.message || 'Failed to explain the selected text');
    } finally {
      setLoading(false);
    }
  }, [explainClause]);

  const handleCloseExplanation = useCallback(() => {
    setExplanationResult(null);
    setError(null);
  }, []);

  return {
    aiLoading: loading,
    aiError: error,
    explanationResult,
    handleExplainSelectedText,
    handleCloseExplanation
  };
}
