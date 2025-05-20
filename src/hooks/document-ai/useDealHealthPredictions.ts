
import { useDocumentAIBase } from './useDocumentAIBase';
import { DealHealthPredictionResponse } from './types';

interface UseDealHealthPredictionsProps {
  processAIRequest: (operation: string, options: any) => Promise<any>;
}

/**
 * Custom hook for deal health prediction operations
 */
export const useDealHealthPredictions = ({ processAIRequest }: UseDealHealthPredictionsProps) => {
  
  /**
   * Get AI-generated prediction about deal health and suggestions for improvement
   */
  const predictDealHealth = async (dealId: string): Promise<DealHealthPredictionResponse | null> => {
    return await processAIRequest('predict_deal_health', {
      dealId,
      content: '', // No content needed for this operation
    });
  };

  return {
    predictDealHealth,
  };
};
