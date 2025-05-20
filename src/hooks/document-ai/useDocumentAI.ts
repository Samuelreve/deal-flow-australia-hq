
import { useDocumentAIBase, UseDocumentAIBaseProps } from './useDocumentAIBase';
import { useExplanationOperations } from './useExplanationOperations';
import { useDocumentGenerationOperations } from './useDocumentGenerationOperations';
import { useDealInsightOperations } from './useDealInsightOperations';
import { useMilestoneGenerationOperations } from './useMilestoneGenerationOperations';
import { useDocumentAnalysisOperations } from './useDocumentAnalysisOperations';
import { useDealChatOperations } from './useDealChatOperations';
import { useDealHealthPredictions } from './useDealHealthPredictions';

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
    suggestNextAction,
    summarizeDeal,
    getDealInsights
  } = useDealInsightOperations({ processAIRequest });
  
  // Get milestone generation operations
  const {
    generateMilestones
  } = useMilestoneGenerationOperations({ processAIRequest });
  
  // Get document analysis operations
  const {
    analyzeDocument
  } = useDocumentAnalysisOperations({ processAIRequest });
  
  // Get deal chat operations
  const {
    dealChatQuery
  } = useDealChatOperations({ processAIRequest });
  
  // Get deal health prediction operations
  const {
    predictDealHealth
  } = useDealHealthPredictions({ processAIRequest });
  
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
    summarizeDeal,
    getDealInsights,
    
    // Milestone generation operations
    generateMilestones,
    
    // Document analysis operations
    analyzeDocument,
    
    // Deal chat operations
    dealChatQuery,
    
    // Deal health prediction operations
    predictDealHealth,
  };
};
