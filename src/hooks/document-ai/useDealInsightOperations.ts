
import { AIRequestOptions } from './useDocumentAIBase';
import { DealSummaryResponse } from './types';

interface DealInsightOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for deal insight operations (next actions, summaries)
 */
export const useDealInsightOperations = ({ processAIRequest }: DealInsightOperationsProps) => {
  /**
   * Suggest next action for a deal
   */
  const suggestNextAction = async (dealId: string) => {
    return processAIRequest('suggest_next_action', {
      content: '',
      context: { dealId }
    });
  };
  
  /**
   * Generate a summary of the current deal status and details
   */
  const summarizeDeal = async (dealId: string): Promise<DealSummaryResponse | null> => {
    return processAIRequest('summarize_deal', {
      content: '',
      context: { dealId }
    });
  };
  
  return {
    suggestNextAction,
    summarizeDeal
  };
};
