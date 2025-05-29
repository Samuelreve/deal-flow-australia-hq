
import { useDocumentAICore, UseDocumentAICoreProps } from './useDocumentAICore';

/**
 * Hook for contract-specific AI operations
 */
export const useContractOperations = (props: UseDocumentAICoreProps) => {
  const { processAIRequest, loading, error, result, clearResult } = useDocumentAICore(props);

  const summarizeContract = async (
    documentId: string,
    versionId: string,
    saveToHistory = false
  ) => {
    return await processAIRequest('summarize_document', {
      content: '',
      documentId,
      documentVersionId: versionId,
      context: { saveToHistory, operationType: 'contract_summary' }
    });
  };

  const explainContractClause = async (
    documentId: string,
    versionId: string,
    clauseText: string
  ) => {
    return await processAIRequest('explain_clause', {
      content: clauseText,
      documentId,
      documentVersionId: versionId,
      context: { operationType: 'clause_explanation' }
    });
  };

  return {
    summarizeContract,
    explainContractClause,
    loading,
    error,
    result,
    clearResult
  };
};
