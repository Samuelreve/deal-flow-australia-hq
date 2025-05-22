
import { useDocumentAIBase, UseDocumentAIBaseProps } from './useDocumentAIBase';
import { useCombinedDocumentAIOperations } from './useCombinedDocumentAIOperations';
import { useEnhancedDocumentOperations } from './useEnhancedDocumentOperations';
import { useAnalysisResultManagement } from './useAnalysisResultManagement';
import { formatInsightsToText } from '../dashboard/insights/utils/insightsFormatter';

/**
 * Main hook for document AI operations, combining all specialized operations
 */
export const useDocumentAI = (props: UseDocumentAIBaseProps) => {
  // Get all operations from combined hook
  const operations = useCombinedDocumentAIOperations(props);
  
  // Get analysis result management functions
  const { saveAnalysisResult } = useAnalysisResultManagement();
  
  // Get enhanced document operations
  const { 
    enhancedAnalyzeDocument, 
    enhancedSummarizeContract 
  } = useEnhancedDocumentOperations({
    analyzeDocument: operations.analyzeDocument,
    summarizeContract: operations.summarizeContract
  });
  
  return {
    // Forward all operations
    ...operations,
    
    // Override with enhanced versions
    analyzeDocument: enhancedAnalyzeDocument,
    summarizeContract: enhancedSummarizeContract,
    
    // Analysis result saving
    saveAnalysisResult,
    
    // Additional utility functions
    formatInsightsToText
  };
};
