
import { AIRequestOptions, AIResponse } from './useDocumentAIBase';
import { DocumentAnalysisResponse } from './types';

interface UseDocumentAnalysisOperationsProps {
  processAIRequest: (
    operation: 'analyze_document',
    options: AIRequestOptions
  ) => Promise<AIResponse | null>;
}

/**
 * Hook for document analysis operations
 */
export const useDocumentAnalysisOperations = ({ processAIRequest }: UseDocumentAnalysisOperationsProps) => {
  
  /**
   * Analyze a document with AI
   */
  const analyzeDocument = async (
    documentId: string,
    documentVersionId: string,
    analysisType: string
  ): Promise<DocumentAnalysisResponse | null> => {
    const response = await processAIRequest('analyze_document', {
      documentId,
      documentVersionId,
      content: '',
      context: { analysisType }
    });
    
    if (response && response.analysis) {
      return {
        // Convert the analysis to object format as required by the type
        analysis: {
          type: analysisType,
          content: typeof response.analysis === 'string' 
            ? JSON.parse(response.analysis) 
            : response.analysis
        },
        disclaimer: response.disclaimer || ''
      };
    }
    
    return null;
  };
  
  return {
    analyzeDocument,
  };
};
