
import { documentAnalysisService } from '@/services/documentAnalysisService';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for managing document analysis results
 */
export const useAnalysisResultManagement = () => {
  const { toast } = useToast();

  /**
   * Save analysis results to the database
   */
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

  /**
   * Display toast notification for saved analysis
   */
  const notifySaved = () => {
    toast({
      title: "Analysis Saved",
      description: "The analysis has been saved for future reference."
    });
  };

  return {
    saveAnalysisResult,
    notifySaved
  };
};
