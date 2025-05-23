
interface UseDocumentAIBaseOperations {
  processAIRequest: (operation: any, options: any) => Promise<any>;
}

/**
 * Hook for document generation operations - now using real AI
 */
export const useDocumentGenerationOperations = ({
  processAIRequest
}: UseDocumentAIBaseOperations) => {
  
  /**
   * Generate a document template based on deal data using real AI
   */
  const generateTemplate = async (
    documentType: string,
    customization: string,
    context?: Record<string, any>
  ) => {
    return processAIRequest(
      'generate_template',
      {
        content: customization || 'Standard template',
        context: { ...context, documentType }
      }
    );
  };
  
  /**
   * Generate a smart template with AI-powered insights using real AI
   */
  const generateSmartTemplate = async (
    documentType: string,
    customization: string,
    context?: Record<string, any>
  ) => {
    return processAIRequest(
      'generate_smart_template',
      {
        content: `Generate ${documentType} with ${customization}`,
        context: { ...context, documentType }
      }
    );
  };
  
  return {
    generateTemplate,
    generateSmartTemplate
  };
};
