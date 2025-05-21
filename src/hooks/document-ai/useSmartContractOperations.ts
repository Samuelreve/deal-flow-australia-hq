
import { AIRequestOptions, AIResponse } from './useDocumentAIBase';
import { ContractSummaryResponse, ContractClauseExplanationResponse } from './types';

interface UseSmartContractOperationsProps {
  processAIRequest: (
    operation: string,
    options: AIRequestOptions
  ) => Promise<AIResponse | null>;
}

/**
 * Hook for smart contract operations
 */
export const useSmartContractOperations = ({ processAIRequest }: UseSmartContractOperationsProps) => {
  
  /**
   * Summarize a contract
   */
  const summarizeContract = async (
    documentId: string,
    documentVersionId: string
  ): Promise<ContractSummaryResponse | null> => {
    const response = await processAIRequest('summarize_contract', {
      documentId,
      documentVersionId,
      content: ''
    });
    
    if (response && response.summary) {
      return {
        summary: response.summary,
        disclaimer: response.disclaimer || '',
        parties: [],
        contractType: '',
        keyObligations: [],
        timelines: [],
        terminationRules: [],
        liabilities: []
      };
    }
    
    return null;
  };
  
  /**
   * Explain a specific clause from a contract
   */
  const explainContractClause = async (
    clauseText: string,
    documentId: string,
    documentVersionId: string
  ): Promise<ContractClauseExplanationResponse | null> => {
    const response = await processAIRequest('explain_contract_clause', {
      documentId,
      documentVersionId,
      content: clauseText
    });
    
    if (response && response.explanation) {
      return {
        explanation: response.explanation,
        // Use optional chaining and provide default values for type safety
        isAmbiguous: response.isAmbiguous ?? false,
        ambiguityExplanation: response.ambiguityExplanation || '',
        disclaimer: response.disclaimer || ''
      };
    }
    
    return null;
  };
  
  return {
    summarizeContract,
    explainContractClause
  };
};
