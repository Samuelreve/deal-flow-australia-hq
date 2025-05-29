
import { UseDocumentAICoreProps } from './useDocumentAICore';
import { useContractOperations } from './useContractOperations';
import { useAnalysisOperations } from './useAnalysisOperations';
import { useDealOperations } from './useDealOperations';
import { useMilestoneOperations } from './useMilestoneOperations';
import { useTemplateOperations } from './useTemplateOperations';
import { useAnalysisResultManagement } from './useAnalysisResultManagement';
import { formatInsightsToText } from '../../components/dashboard/insights/utils/insightsFormatter';

/**
 * Main hook for document AI operations, combining specialized operation hooks
 */
export const useDocumentAI = (props: UseDocumentAICoreProps) => {
  // Get specialized operations
  const contractOps = useContractOperations(props);
  const analysisOps = useAnalysisOperations(props);
  const dealOps = useDealOperations(props);
  const milestoneOps = useMilestoneOperations(props);
  const templateOps = useTemplateOperations(props);
  
  // Get analysis result management functions
  const { saveAnalysisResult } = useAnalysisResultManagement();
  
  // Determine loading state (any operation in progress)
  const loading = contractOps.loading || analysisOps.loading || dealOps.loading || 
                 milestoneOps.loading || templateOps.loading;
  
  // Get the most recent error from any operation
  const error = contractOps.error || analysisOps.error || dealOps.error || 
               milestoneOps.error || templateOps.error;

  // Get the most recent result from any operation
  const result = contractOps.result || analysisOps.result || dealOps.result || 
                milestoneOps.result || templateOps.result;

  return {
    // Contract operations
    summarizeContract: contractOps.summarizeContract,
    explainContractClause: contractOps.explainContractClause,
    
    // Analysis operations
    analyzeDocument: analysisOps.analyzeDocument,
    summarizeDocument: analysisOps.summarizeDocument,
    
    // Deal operations
    summarizeDeal: dealOps.summarizeDeal,
    predictDealHealth: dealOps.predictDealHealth,
    getDealInsights: dealOps.getDealInsights,
    dealChatQuery: dealOps.dealChatQuery,
    
    // Milestone operations
    generateMilestones: milestoneOps.generateMilestones,
    explainMilestone: milestoneOps.explainMilestone,
    suggestNextAction: milestoneOps.suggestNextAction,
    
    // Template operations
    generateTemplate: templateOps.generateTemplate,
    generateSmartTemplate: templateOps.generateSmartTemplate,
    explainClause: templateOps.explainClause,
    
    // Analysis result saving
    saveAnalysisResult,
    
    // State
    loading,
    error,
    result,
    
    // Utility functions
    formatInsightsToText,
    
    // Clear functions
    clearResult: () => {
      contractOps.clearResult();
      analysisOps.clearResult();
      dealOps.clearResult();
      milestoneOps.clearResult();
      templateOps.clearResult();
    },
    clearError: () => {
      // Individual operations will clear their own errors
      // This is a no-op for backward compatibility
    }
  };
};
