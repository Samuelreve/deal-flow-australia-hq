
import { useDocumentAIBase } from './useDocumentAIBase';
import { useExplanationOperations } from './useExplanationOperations';
import { useDocumentGenerationOperations } from './useDocumentGenerationOperations';
import { useDealInsightOperations } from './useDealInsightOperations';
import { useMilestoneGenerationOperations } from './useMilestoneGenerationOperations';
import { useDocumentAnalysisOperations } from './useDocumentAnalysisOperations';
import { useDealChatOperations } from './useDealChatOperations';
import { useDealHealthPredictions } from './useDealHealthPredictions';
import { useSmartContractOperations } from './useSmartContractOperations';
import { UseDocumentAIBaseProps } from './useDocumentAIBase';

/**
 * Hook that combines all AI operations into a single interface
 */
export const useCombinedDocumentAIOperations = (props: UseDocumentAIBaseProps) => {
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
    generateSmartTemplate,
    summarizeDocument,
    summarizeVersionChanges
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
  
  // Get smart contract operations
  const {
    summarizeContract,
    explainContractClause
  } = useSmartContractOperations({ processAIRequest });

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
    generateSmartTemplate,
    summarizeDocument,
    summarizeVersionChanges,
    
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
    
    // Smart contract operations
    summarizeContract,
    explainContractClause,
  };
};
