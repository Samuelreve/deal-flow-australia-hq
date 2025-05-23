
import { AIRequestOptions } from './useDocumentAIBase';

export interface UseExplanationOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for AI explanation operations (explain clause, milestone) - now using real AI
 */
export const useExplanationOperations = ({ 
  processAIRequest 
}: UseExplanationOperationsProps) => {
  
  /**
   * Explain a legal clause or document section using real AI
   */
  const explainClause = async (clause: string, context?: Record<string, any>) => {
    return processAIRequest('explain_clause', { content: clause, context });
  };

  /**
   * Explain a milestone in the deal context using real AI
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
