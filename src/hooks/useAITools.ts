
import { useState } from 'react';
import { ContractSummaryResponse, ContractClauseExplanationResponse, DealHealthPredictionResponse, DealSummaryResponse } from '@/hooks/document-ai/types';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { toast } from 'sonner';

interface UseAIToolsProps {
  dealId: string;
  documentId?: string;
}

export function useAITools({ dealId, documentId }: UseAIToolsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Initialize AI operations hook
  const {
    summarizeDeal,
    predictDealHealth,
    summarizeDocument,
    explainClause,
    summarizeContract,
    explainContractClause
  } = useDocumentAI({
    dealId,
    documentId
  });

  // Handle AI operation execution
  const handleRunAI = async (operation: string, params: any) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      let result;
      
      switch (operation) {
        case 'summarize_deal':
          result = await summarizeDeal(params.dealId);
          break;
        case 'predict_deal_health':
          result = await predictDealHealth(params.dealId);
          break;
        case 'summarize_document':
          result = await summarizeDocument(params.documentId, params.versionId);
          break;
        case 'summarize_contract':
          result = await summarizeContract(params.documentId, params.versionId);
          break;
        case 'explain_clause':
          result = await explainClause(params.clauseText);
          break;
        case 'explain_contract_clause':
          result = await explainContractClause(params.documentId, params.versionId, params.clauseText);
          break;
        default:
          throw new Error('Unknown AI operation');
      }
      
      if (result) {
        setResult(result);
        return result;
      }
    } catch (error: any) {
      console.error(`Error executing AI operation ${operation}:`, error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: 'AI Operation Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
    
    return null;
  };

  return {
    aiLoading: loading,
    aiError: error,
    aiResult: result,
    runAI: handleRunAI,
    clearAIResult: () => setResult(null)
  };
}
