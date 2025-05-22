
import { UseDocumentAIBaseProps, useDocumentAIBase } from './useDocumentAIBase';
import { useDocumentAnalysisOperations } from './useDocumentAnalysisOperations';
import { useDocumentGenerationOperations } from './useDocumentGenerationOperations';
import { useExplanationOperations } from './useExplanationOperations';
import { useMilestoneGenerationOperations } from './useMilestoneGenerationOperations';
import { useDealInsightOperations } from './useDealInsightOperations';
import { useSmartContractOperations } from './useSmartContractOperations';

/**
 * Combines all document AI operations into a single hook
 */
export const useCombinedDocumentAIOperations = (props: UseDocumentAIBaseProps) => {
  const baseOperations = useDocumentAIBase(props);
  
  // Document analysis operations
  const analysisOperations = useDocumentAnalysisOperations(baseOperations);
  
  // Document generation operations
  const generationOperations = useDocumentGenerationOperations(baseOperations);
  
  // Explanation operations
  const explanationOperations = useExplanationOperations(baseOperations);
  
  // Milestone operations
  const milestoneOperations = useMilestoneGenerationOperations(baseOperations);
  
  // Deal insights operations
  const insightOperations = useDealInsightOperations(baseOperations);
  
  // Smart contract operations
  const contractOperations = useSmartContractOperations(baseOperations);
  
  // Return combined operations
  return {
    // Base operations
    ...baseOperations,
    
    // Analysis operations
    ...analysisOperations,
    
    // Generation operations
    ...generationOperations,
    
    // Explanation operations
    ...explanationOperations,
    
    // Milestone operations
    ...milestoneOperations,
    
    // Deal insights operations
    ...insightOperations,
    
    // Smart contract operations
    ...contractOperations
  };
};
