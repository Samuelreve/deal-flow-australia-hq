
import { AIRequestOptions } from './useDocumentAIBase';

interface UseDocumentGenerationOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for document generation AI operations
 */
export const useDocumentGenerationOperations = ({ processAIRequest }: UseDocumentGenerationOperationsProps) => {
  /**
   * Generate a document template based on provided requirements
   */
  const generateTemplate = async (requirements: string) => {
    return await processAIRequest('generate_template', {
      content: requirements
    });
  };

  /**
   * Summarize a document
   */
  const summarizeDocument = async (documentId: string, documentVersionId: string) => {
    return await processAIRequest('summarize_document', {
      content: '',
      documentId,
      documentVersionId
    });
  };

  /**
   * Summarize changes between document versions
   */
  const summarizeVersionChanges = async (
    documentId: string, 
    currentVersionId: string, 
    previousVersionId: string
  ) => {
    return await processAIRequest('summarize_version_changes', {
      content: '',
      documentId,
      currentVersionId,
      previousVersionId
    });
  };

  return {
    generateTemplate,
    summarizeDocument,
    summarizeVersionChanges
  };
};
