
interface UseDocumentAIBaseOperations {
  processAIRequest: (operation: any, options: any) => Promise<any>;
}

/**
 * Hook for smart contract operations
 */
export const useSmartContractOperations = ({
  processAIRequest
}: UseDocumentAIBaseOperations) => {
  
  /**
   * Analyze a contract document and provide insights
   */
  const analyzeSmartContract = async (
    documentId: string,
    documentVersionId: string,
    analysisType: string
  ) => {
    return processAIRequest(
      'analyze_document',
      {
        documentId,
        documentVersionId,
        content: analysisType
      }
    );
  };
  
  /**
   * Explain a specific clause in a contract
   */
  const explainContractClause = async (
    documentId: string,
    documentVersionId: string,
    clause: string
  ) => {
    return processAIRequest(
      'explain_clause',
      {
        documentId,
        documentVersionId,
        content: clause
      }
    );
  };
  
  /**
   * Summarize an entire contract document
   */
  const summarizeContract = async (
    documentId: string,
    documentVersionId: string
  ) => {
    return processAIRequest(
      'summarize_document',
      {
        documentId,
        documentVersionId,
        content: 'Full contract summary'
      }
    );
  };
  
  return {
    analyzeSmartContract,
    explainContractClause,
    summarizeContract
  };
};
