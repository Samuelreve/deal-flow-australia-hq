
import { AIRequestOptions } from './useDocumentAIBase';

export interface UseDealInsightOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for AI deal insight operations
 */
export const useDealInsightOperations = ({
  processAIRequest
}: UseDealInsightOperationsProps) => {
  
  /**
   * Get AI suggested next action for the deal
   */
  const suggestNextAction = async () => {
    return processAIRequest('suggest_next_action', {
      content: ''
    });
  };

  return {
    suggestNextAction
  };
};
