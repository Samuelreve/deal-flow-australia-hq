
import { useDocumentAICore, UseDocumentAICoreProps } from './useDocumentAICore';

/**
 * Hook for template generation AI operations
 */
export const useTemplateOperations = (props: UseDocumentAICoreProps) => {
  const { processAIRequest, loading, error, result, clearResult } = useDocumentAICore(props);

  const generateTemplate = async (templateType: string, requirements: string) => {
    return await processAIRequest('generate_template', {
      content: requirements,
      context: { 
        templateType,
        operationType: 'template_generation'
      }
    });
  };

  const generateSmartTemplate = async (
    dealId: string,
    templateType: string,
    customRequirements?: string
  ) => {
    return await processAIRequest('generate_smart_template', {
      content: customRequirements || '',
      context: { 
        dealId,
        templateType,
        operationType: 'smart_template_generation'
      }
    });
  };

  const explainClause = async (clauseText: string) => {
    return await processAIRequest('explain_clause', {
      content: clauseText,
      context: { operationType: 'clause_explanation' }
    });
  };

  return {
    generateTemplate,
    generateSmartTemplate,
    explainClause,
    loading,
    error,
    result,
    clearResult
  };
};
