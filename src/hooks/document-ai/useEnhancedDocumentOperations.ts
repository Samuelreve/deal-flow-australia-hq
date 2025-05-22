
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Enhanced document operations with better error handling and UI feedback
 */
export const useEnhancedDocumentOperations = ({
  analyzeDocument,
  summarizeContract
}: {
  analyzeDocument: (...args: any[]) => Promise<any>;
  summarizeContract: (...args: any[]) => Promise<any>;
}) => {
  const [enhancedLoading, setEnhancedLoading] = useState(false);

  /**
   * Enhanced document analysis with better error handling
   */
  const enhancedAnalyzeDocument = async (...args: Parameters<typeof analyzeDocument>) => {
    setEnhancedLoading(true);
    try {
      const result = await analyzeDocument(...args);
      
      if (result) {
        toast.success('Document analysis completed');
      }
      
      return result;
    } catch (error: any) {
      console.error('Enhanced document analysis error:', error);
      toast.error('Failed to analyze document: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setEnhancedLoading(false);
    }
  };

  /**
   * Enhanced contract summarization with better error handling
   */
  const enhancedSummarizeContract = async (...args: Parameters<typeof summarizeContract>) => {
    setEnhancedLoading(true);
    try {
      const result = await summarizeContract(...args);
      
      if (result) {
        toast.success('Contract summary generated');
      }
      
      return result;
    } catch (error: any) {
      console.error('Enhanced contract summary error:', error);
      toast.error('Failed to summarize contract: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setEnhancedLoading(false);
    }
  };

  return {
    enhancedAnalyzeDocument,
    enhancedSummarizeContract,
    enhancedLoading
  };
};
