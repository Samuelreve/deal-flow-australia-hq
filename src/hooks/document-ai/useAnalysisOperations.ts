
import { useDocumentAICore, UseDocumentAICoreProps } from './useDocumentAICore';

/**
 * Hook for document analysis AI operations
 */
export const useAnalysisOperations = (props: UseDocumentAICoreProps) => {
  const { processAIRequest, loading, error, result, clearResult } = useDocumentAICore(props);

  const analyzeDocument = async (
    documentId: string,
    versionId: string,
    analysisType: string,
    saveToHistory = false
  ) => {
    return await processAIRequest('analyze_document', {
      content: analysisType,
      documentId,
      documentVersionId: versionId,
      context: { 
        analysisType,
        saveToHistory,
        operationType: 'document_analysis'
      }
    });
  };

  const summarizeDocument = async (
    documentId: string,
    versionId: string
  ) => {
    return await processAIRequest('summarize_document', {
      content: '',
      documentId,
      documentVersionId: versionId,
      context: { operationType: 'document_summary' }
    });
  };

  return {
    analyzeDocument,
    summarizeDocument,
    loading,
    error,
    result,
    clearResult
  };
};
