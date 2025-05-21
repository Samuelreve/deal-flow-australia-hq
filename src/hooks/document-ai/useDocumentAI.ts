
import { useDocumentAIBase, UseDocumentAIBaseProps } from './useDocumentAIBase';
import { useExplanationOperations } from './useExplanationOperations';
import { useDocumentGenerationOperations } from './useDocumentGenerationOperations';
import { useDealInsightOperations } from './useDealInsightOperations';
import { useMilestoneGenerationOperations } from './useMilestoneGenerationOperations';
import { useDocumentAnalysisOperations } from './useDocumentAnalysisOperations';
import { useDealChatOperations } from './useDealChatOperations';
import { useDealHealthPredictions } from './useDealHealthPredictions';
import { useSmartContractOperations } from './useSmartContractOperations';
import { documentAnalysisService } from '@/services/documentAnalysisService';
import { toast } from '@/components/ui/use-toast';

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

  // Function to save analysis results
  const saveAnalysisResult = async (
    analysisType: string, 
    content: any, 
    documentId: string, 
    documentVersionId: string
  ) => {
    try {
      await documentAnalysisService.saveAnalysis({
        documentId,
        documentVersionId,
        analysisType,
        analysisContent: content
      });
      return true;
    } catch (error) {
      console.error("Error saving analysis:", error);
      return false;
    }
  };
  
  // Enhanced analyze document with auto-saving
  const enhancedAnalyzeDocument = async (
    documentId: string,
    documentVersionId: string,
    analysisType: string,
    autoSave = true
  ) => {
    try {
      const result = await analyzeDocument(documentId, documentVersionId, analysisType);
      
      // Auto-save the analysis if requested
      if (result && autoSave) {
        const saved = await saveAnalysisResult(
          analysisType, 
          result.analysis.content, 
          documentId, 
          documentVersionId
        );
        
        if (saved) {
          toast({
            title: "Analysis Saved",
            description: "The analysis has been saved for future reference."
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Enhanced analyze document error:", error);
      throw error;
    }
  };
  
  // Enhanced summarize contract with auto-saving
  const enhancedSummarizeContract = async (
    documentId: string,
    documentVersionId: string,
    autoSave = true
  ) => {
    try {
      const result = await summarizeContract(documentId, documentVersionId);
      
      // Auto-save the summary if requested
      if (result && autoSave) {
        const saved = await saveAnalysisResult(
          'contract_summary', 
          { summary: result.summary }, 
          documentId, 
          documentVersionId
        );
        
        if (saved) {
          toast({
            title: "Summary Saved",
            description: "The contract summary has been saved for future reference."
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Enhanced summarize contract error:", error);
      throw error;
    }
  };
  
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
    summarizeVersionChanges,
    
    // Deal insight operations
    suggestNextAction,
    summarizeDeal,
    getDealInsights,
    
    // Milestone generation operations
    generateMilestones,
    
    // Document analysis operations
    analyzeDocument: enhancedAnalyzeDocument,
    
    // Deal chat operations
    dealChatQuery,
    
    // Deal health prediction operations
    predictDealHealth,
    
    // Smart contract operations
    summarizeContract: enhancedSummarizeContract,
    explainContractClause,
    
    // Analysis result saving
    saveAnalysisResult
  };
};
