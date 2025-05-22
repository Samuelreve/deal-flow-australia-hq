
import { useState } from 'react';
import { AIRequestOptions } from './useDocumentAIBase';
import { DealSummaryResponse, DealInsightsResponse } from './types';

interface DealInsightOperationsProps {
  processAIRequest: (operation: string, options: AIRequestOptions) => Promise<any>;
}

/**
 * Hook for deal insight operations (next actions, summaries, insights)
 */
export const useDealInsightOperations = ({ processAIRequest }: DealInsightOperationsProps) => {
  const [latestError, setLatestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Error handler for insight operations
   */
  const handleError = (error: any, defaultMessage: string) => {
    const errorMessage = error.message || defaultMessage;
    setLatestError(errorMessage);
    console.error(`Deal insight error: ${defaultMessage}`, error);
    throw new Error(errorMessage);
  };

  /**
   * Suggest next action for a deal
   */
  const suggestNextAction = async (dealId: string) => {
    try {
      setIsLoading(true);
      setLatestError(null);
      return await processAIRequest('suggest_next_action', {
        content: '',
        context: { dealId }
      });
    } catch (error: any) {
      handleError(error, 'Failed to suggest next action');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Generate a summary of the current deal status and details
   */
  const summarizeDeal = async (dealId: string): Promise<DealSummaryResponse | null> => {
    try {
      setIsLoading(true);
      setLatestError(null);
      return await processAIRequest('summarize_deal', {
        content: '',
        context: { dealId }
      });
    } catch (error: any) {
      handleError(error, 'Failed to summarize deal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Generate comprehensive insights across all deals the user has access to
   */
  const getDealInsights = async (): Promise<DealInsightsResponse | null> => {
    try {
      setIsLoading(true);
      setLatestError(null);
      return await processAIRequest('get_deal_insights', {
        content: '',
        context: { }
      });
    } catch (error: any) {
      handleError(error, 'Failed to get deal insights');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format insights data to text representation
   */
  const formatInsightsToText = (insightsData: DealInsightsResponse | null): string => {
    if (!insightsData || !insightsData.insights || !Array.isArray(insightsData.insights)) {
      return "No insights available at this time.";
    }
    
    let text = "**Overall Portfolio Health:** Your deal portfolio is being analyzed\n\n";
    
    // Add high priority insights first
    const highPriorityInsights = insightsData.insights.filter(i => i.priority === "high");
    if (highPriorityInsights.length > 0) {
      text += "**Deals Needing Attention:**\n";
      highPriorityInsights.forEach(insight => {
        text += `• ${insight.title}: ${insight.description}\n`;
      });
      text += "\n";
    }
  
    // Add medium/low priority positive insights
    const positiveInsights = insightsData.insights.filter(i => 
      i.priority !== "high" && i.type === "positive");
    if (positiveInsights.length > 0) {
      text += "**Deals Progressing Well:**\n";
      positiveInsights.forEach(insight => {
        text += `• ${insight.title}: ${insight.description}\n`;
      });
      text += "\n";
    }
  
    // Add recommendations
    if (insightsData.recommendations && insightsData.recommendations.length > 0) {
      text += "**Recommendations:**\n";
      insightsData.recommendations.forEach(rec => {
        text += `• ${rec}\n`;
      });
    }
  
    return text;
  };
  
  return {
    suggestNextAction,
    summarizeDeal,
    getDealInsights,
    formatInsightsToText,
    error: latestError,
    clearError: () => setLatestError(null),
    isLoading
  };
};
