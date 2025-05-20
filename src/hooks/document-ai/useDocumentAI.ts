
import { useDocumentAIBase, UseDocumentAIBaseProps } from './useDocumentAIBase';
import { useExplanationOperations } from './useExplanationOperations';
import { useDocumentGenerationOperations } from './useDocumentGenerationOperations';
import { useDealInsightOperations } from './useDealInsightOperations';
import { useMilestoneGenerationOperations } from './useMilestoneGenerationOperations';

/**
 * Main hook for document AI operations, combining all specialized operations
 */
export const useDocumentAI = (props: UseDocumentAIBaseProps) => {
  const {
    loading,
    error,
    result,
    processAIRequest,
    clearResult
  } = useDocumentAIBase(props);
  
  // Get explanation operations (clause, milestone)
  const { 
    explainClause,
    explainMilestone
  } = useExplanationOperations({ processAIRequest });
  
  // Get document generation operations
  const { 
    generateTemplate,
    summarizeDocument
  } = useDocumentGenerationOperations({ processAIRequest });
  
  // Get deal insight operations
  const {
    suggestNextAction
  } = useDealInsightOperations({ processAIRequest });
  
  // Get milestone generation operations
  const {
    generateMilestones
  } = useMilestoneGenerationOperations({ processAIRequest });
  
  return {
    // Base properties
    loading,
    error,
    result,
    clearResult,
    
    // Explanation operations
    explainClause,
    explainMilestone,
    
    // Document generation operations
    generateTemplate,
    summarizeDocument,
    
    // Deal insight operations
    suggestNextAction,
    
    // Milestone generation operations
    generateMilestones,
  };
};
