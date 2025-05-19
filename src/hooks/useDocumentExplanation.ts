
import { useState } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { toast } from '@/components/ui/use-toast';

interface UseDocumentExplanationProps {
  dealId?: string;
}

export function useDocumentExplanation({ dealId }: UseDocumentExplanationProps) {
  const { explainClause, loading: aiLoading, result, error, clearResult } = useDocumentAI({
    dealId,
  });
  
  const [explanationResult, setExplanationResult] = useState<{ explanation?: string; disclaimer: string } | null>(null);

  // Handle triggering AI explanation
  const handleExplainSelectedText = async (selectedText: string | null) => {
    if (!selectedText || aiLoading) return;

    setExplanationResult(null);

    try {
      const result = await explainClause(selectedText);
      setExplanationResult(result || { explanation: 'Could not get explanation.', disclaimer: 'Failed to retrieve explanation.' });
    } catch (err) {
      console.error('Error explaining clause:', err);
      setExplanationResult({ explanation: 'An error occurred while getting the explanation.', disclaimer: 'Error occurred.' });
    }
  };

  // Handle closing explanation display
  const handleCloseExplanation = () => {
    setExplanationResult(null);
    clearResult();
  };

  return {
    aiLoading,
    result,
    explanationResult,
    setExplanationResult,
    handleExplainSelectedText,
    handleCloseExplanation
  };
}
