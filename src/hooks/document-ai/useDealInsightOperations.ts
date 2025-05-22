
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

  /**
   * Suggest next action for a deal
   */
  const suggestNextAction = async (dealId: string) => {
    try {
      setLatestError(null);
      return await processAIRequest('suggest_next_action', {
        content: '',
        context: { dealId }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to suggest next action';
      setLatestError(errorMessage);
      console.error('Error suggesting next action:', error);
      throw new Error(errorMessage);
    }
  };
  
  /**
   * Generate a summary of the current deal status and details
   */
  const summarizeDeal = async (dealId: string): Promise<DealSummaryResponse | null> => {
    try {
      setLatestError(null);
      return await processAIRequest('summarize_deal', {
        content: '',
        context: { dealId }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to summarize deal';
      setLatestError(errorMessage);
      console.error('Error summarizing deal:', error);
      throw new Error(errorMessage);
    }
  };
  
  /**
   * Generate comprehensive insights across all deals the user has access to
   */
  const getDealInsights = async (): Promise<DealInsightsResponse | null> => {
    try {
      setLatestError(null);
      return await processAIRequest('get_deal_insights', {
        content: '',
        context: { }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get deal insights';
      setLatestError(errorMessage);
      console.error('Error getting deal insights:', error);
      throw new Error(errorMessage);
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
    const highPriorityInsights = insightsData.insights.filter((i: any) => i.priority === "high");
    if (highPriorityInsights.length > 0) {
      text += "**Deals Needing Attention:**\n";
      highPriorityInsights.forEach((insight: any) => {
        text += `• ${insight.title}: ${insight.description}\n`;
      });
      text += "\n";
    }
  
    // Add medium/low priority positive insights
    const positiveInsights = insightsData.insights.filter((i: any) => 
      i.priority !== "high" && i.type === "positive");
    if (positiveInsights.length > 0) {
      text += "**Deals Progressing Well:**\n";
      positiveInsights.forEach((insight: any) => {
        text += `• ${insight.title}: ${insight.description}\n`;
      });
      text += "\n";
    }
  
    // Add recommendations
    if (insightsData.recommendations && insightsData.recommendations.length > 0) {
      text += "**Recommendations:**\n";
      insightsData.recommendations.forEach((rec: string) => {
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
    clearError: () => setLatestError(null)
  };
};
