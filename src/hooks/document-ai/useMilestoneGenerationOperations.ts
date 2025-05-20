
import { AIRequestOptions } from './useDocumentAIBase';
import { MilestoneGenerationResponse } from './types';

interface UseMilestoneGenerationOperationsProps {
  processAIRequest: (operation: 'generate_milestones', options: AIRequestOptions) => Promise<MilestoneGenerationResponse | null>;
}

/**
 * Hook for AI milestone generation operations
 */
export const useMilestoneGenerationOperations = ({ processAIRequest }: UseMilestoneGenerationOperationsProps) => {
  
  /**
   * Generate milestones based on deal information
   */
  const generateMilestones = async (dealType?: string, dealContext?: Record<string, any>) => {
    try {
      // Content can be empty as we'll fetch deal data server-side
      const content = '';
      
      const context = {
        dealType,
        ...dealContext
      };
      
      const result = await processAIRequest('generate_milestones', {
        content,
        context
      });
      
      return result;
    } catch (error) {
      console.error('Error generating milestones:', error);
      return null;
    }
  };
  
  return {
    generateMilestones
  };
};
