
import { AIOperation, AIRequestOptions, AIResponse } from '../document-ai/useDocumentAIBase';

interface DocumentGenerationOperationsProps {
  processAIRequest: (operation: AIOperation, options: AIRequestOptions) => Promise<AIResponse | null>;
}

/**
 * Hook for document generation operations
 */
export const useDocumentGenerationOperations = ({ processAIRequest }: DocumentGenerationOperationsProps) => {
  /**
   * Generate a document template
   */
  const generateTemplate = async (
    documentType: string,
    context: Record<string, any>
  ): Promise<AIResponse | null> => {
    return processAIRequest('generate_template', {
      content: documentType,
      context
    });
  };
  
  /**
   * Generate a smart template with AI customization
   */
  const generateSmartTemplate = async (
    documentType: string,
    customization: string,
    context: Record<string, any>
  ): Promise<AIResponse | null> => {
    return processAIRequest('generate_smart_template', {
      content: `${documentType}:${customization}`,
      context
    });
  };
  
  /**
   * Summarize a document's content
   */
  const summarizeDocument = async (
    documentId: string,
    documentVersionId: string
  ): Promise<AIResponse | null> => {
    return processAIRequest('summarize_document', {
      documentId,
      documentVersionId,
      content: ''
    });
  };
  
  /**
   * Summarize changes between document versions
   */
  const summarizeVersionChanges = async (
    documentId: string,
    currentVersionId: string,
    previousVersionId: string
  ): Promise<AIResponse | null> => {
    console.log(`Requesting version change summary: doc=${documentId}, current=${currentVersionId}, prev=${previousVersionId}`);
    
    return processAIRequest('summarize_version_changes', {
      documentId,
      currentVersionId,
      previousVersionId,
      content: ''
    });
  };
  
  return {
    generateTemplate,
    generateSmartTemplate,
    summarizeDocument,
    summarizeVersionChanges
  };
};
