
import { AIRequestOptions, AIResponse } from './useDocumentAIBase';

interface UseSmartContractOperationsProps {
  processAIRequest: (
    operation: 'analyze_document',
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
    documentVersionId: string,
    autoSave: boolean = true
  ) => {
    const response = await processAIRequest('analyze_document', {
      documentId,
      documentVersionId,
      content: '',
      context: { 
        analysisType: 'contract_summary',
        saveAnalysis: autoSave 
      }
    });
    
    if (response && response.analysis && response.analysis.content) {
      return {
        summary: response.analysis.content.summary || '',
        disclaimer: response.disclaimer || ''
      };
    }
    
    return null;
  };
  
  /**
   * Explain a contract clause
   */
  const explainContractClause = async (
    clause: string,
    documentId: string,
    documentVersionId: string
  ) => {
    const response = await processAIRequest('analyze_document', {
      documentId,
      documentVersionId,
      content: clause,
      context: { 
        analysisType: 'explain_contract_clause',
        clause 
      }
    });
    
    if (response) {
      return {
        explanation: response.explanation || 
          (response.analysis?.content?.explanation ?? ''),
        isAmbiguous: response.isAmbiguous || false,
        ambiguityExplanation: response.ambiguityExplanation || '',
        disclaimer: response.disclaimer || ''
      };
    }
    
    return null;
  };
  
  return {
    summarizeContract,
    explainContractClause,
  };
};
