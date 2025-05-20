
import { AIRequestOptions, AIResponse } from './useDocumentAIBase';
import { MilestoneGenerationResponse } from './types';

interface UseMilestoneGenerationOperationsProps {
  processAIRequest: (
    operation: 'generate_milestones',
    options: AIRequestOptions
  ) => Promise<AIResponse | null>;
}

/**
 * Hook for milestone generation operations
 */
export const useMilestoneGenerationOperations = ({ processAIRequest }: UseMilestoneGenerationOperationsProps) => {
  
  /**
   * Generate milestones for a deal based on deal type
   */
  const generateMilestones = async (dealType: string): Promise<MilestoneGenerationResponse | null> => {
    const response = await processAIRequest('generate_milestones', {
      content: dealType,
    });
    
    if (response && response.milestones) {
      return {
        milestones: response.milestones,
        disclaimer: response.disclaimer || ''
      };
    }
    
    return null;
  };
  
  return {
    generateMilestones,
  };
};
