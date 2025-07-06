
import { useDocumentAICore, UseDocumentAICoreProps } from './useDocumentAICore';

/**
 * Hook for milestone-related AI operations
 */
export const useMilestoneOperations = (props: UseDocumentAICoreProps) => {
  const { processAIRequest, loading, error, result, clearResult } = useDocumentAICore(props);

  const generateMilestones = async (dealType?: string) => {
    return await processAIRequest('generate_milestones', {
      content: dealType || '',
      context: { 
        dealType: dealType || 'Asset Sale',
        operationType: 'milestone_generation'
      }
    });
  };

  const explainMilestone = async (milestoneId: string, milestoneContent: string) => {
    return await processAIRequest('explain_milestone', {
      content: milestoneContent,
      milestoneId,
      context: { operationType: 'milestone_explanation' }
    });
  };

  const suggestNextAction = async (dealId: string, currentContext: string) => {
    return await processAIRequest('suggest_next_action', {
      content: currentContext,
      context: { 
        dealId,
        operationType: 'next_action_suggestion'
      }
    });
  };

  return {
    generateMilestones,
    explainMilestone,
    suggestNextAction,
    loading,
    error,
    result,
    clearResult
  };
};
