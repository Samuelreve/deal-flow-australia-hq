
import { AIRequestOptions } from './useDocumentAIBase';

export interface UseExplanationOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for AI explanation operations (explain clause, milestone)
 */
export const useExplanationOperations = ({ 
  processAIRequest 
}: UseExplanationOperationsProps) => {
  
  /**
   * Explain a legal clause or document section
   */
  const explainClause = async (clause: string, context?: Record<string, any>) => {
    return processAIRequest('explain_clause', { content: clause, context });
  };

  /**
   * Explain a milestone in the deal context
   */
  const explainMilestone = async (milestoneId: string) => {
    return processAIRequest('explain_milestone', {
      content: '',
      milestoneId
    });
  };

  return {
    explainClause,
    explainMilestone
  };
};
