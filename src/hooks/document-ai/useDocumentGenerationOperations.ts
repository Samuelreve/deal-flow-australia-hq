
interface UseDocumentAIBaseOperations {
  processAIRequest: (operation: any, options: any) => Promise<any>;
}

/**
 * Hook for document generation operations
 */
export const useDocumentGenerationOperations = ({
  processAIRequest
}: UseDocumentAIBaseOperations) => {
  
  /**
   * Generate a document template based on deal data
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
        context: context || {}
      }
    );
  };
  
  /**
   * Generate a smart template with AI-powered insights
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
        context: context || {}
      }
    );
  };
  
  return {
    generateTemplate,
    generateSmartTemplate
  };
};
