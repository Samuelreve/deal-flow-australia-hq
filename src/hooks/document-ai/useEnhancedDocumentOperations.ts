
import { useToast } from '@/components/ui/use-toast';
import { useAnalysisResultManagement } from './useAnalysisResultManagement';

interface UseEnhancedDocumentOperationsProps {
  analyzeDocument: (documentId: string, documentVersionId: string, analysisType: string) => Promise<any>;
  summarizeContract: (documentId: string, documentVersionId: string) => Promise<any>;
}

/**
 * Hook for enhanced document operations with auto-saving functionality
 */
export const useEnhancedDocumentOperations = ({
  analyzeDocument,
  summarizeContract
}: UseEnhancedDocumentOperationsProps) => {
  const { toast } = useToast();
  const { saveAnalysisResult } = useAnalysisResultManagement();

  /**
   * Enhanced analyze document with auto-saving
   */
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
  
  /**
   * Enhanced summarize contract with auto-saving
   */
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
    enhancedAnalyzeDocument,
    enhancedSummarizeContract
  };
};
