
import { useCallback } from 'react';
import { ContractSummaryResponse, ContractClauseExplanationResponse } from '@/hooks/document-ai/types';

interface UseSmartContractOperationsProps {
  processAIRequest: (operation: string, options: any) => Promise<any>;
}

export const useSmartContractOperations = ({ processAIRequest }: UseSmartContractOperationsProps) => {
  /**
   * Summarize a contract document
   */
  const summarizeContract = useCallback(async (
    documentId: string,
    documentVersionId: string,
    context?: Record<string, any>
  ): Promise<ContractSummaryResponse | null> => {
    return processAIRequest('summarize_contract', {
      content: '',
      documentId,
      documentVersionId,
      context
    });
  }, [processAIRequest]);

  /**
   * Explain a contract clause
   */
  const explainContractClause = useCallback(async (
    selectedText: string,
    documentId?: string,
    documentVersionId?: string,
    context?: Record<string, any>
  ): Promise<ContractClauseExplanationResponse | null> => {
    return processAIRequest('explain_contract_clause', {
      content: selectedText,
      selectedText,
      documentId,
      documentVersionId,
      context
    });
  }, [processAIRequest]);

  return {
    summarizeContract,
    explainContractClause
  };
};
