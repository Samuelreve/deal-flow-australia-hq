import { AIRequestOptions } from './useDocumentAIBase';

export interface UseDocumentGenerationOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for AI document generation and summarization operations
 */
export const useDocumentGenerationOperations = ({
  processAIRequest
}: UseDocumentGenerationOperationsProps) => {
  
  /**
   * Generate a document template based on requirements and template type
   */
  const generateTemplate = async (requirements: string, templateType: string, additionalContext?: Record<string, any>) => {
    const context = {
      templateType,
      ...additionalContext
    };
    
    return processAIRequest('generate_template', { content: requirements, context });
  };
  
  /**
   * Summarize a document using its content or by ID
   */
  const summarizeDocument = async (
    documentContent?: string, 
    documentId?: string, 
    documentVersionId?: string
  ) => {
    // If documentContent is provided, use it directly
    // Otherwise, the backend will fetch it using the IDs
    return processAIRequest('summarize_document', { 
      content: documentContent || '', 
      documentId, 
      documentVersionId 
    });
  };

  return {
    generateTemplate,
    summarizeDocument
  };
};
