
import { useDocumentAICore, UseDocumentAICoreProps } from './useDocumentAICore';

/**
 * Hook for deal-related AI operations
 */
export const useDealOperations = (props: UseDocumentAICoreProps) => {
  const { processAIRequest, loading, error, result, clearResult } = useDocumentAICore(props);

  const summarizeDeal = async (dealId: string) => {
    return await processAIRequest('summarize_document', {
      content: '',
      context: { 
        dealId,
        operationType: 'deal_summary'
      }
    });
  };

  const predictDealHealth = async (dealId: string) => {
    return await processAIRequest('analyze_document', {
      content: 'health_prediction',
      context: { 
        dealId,
        operationType: 'deal_health_prediction'
      }
    });
  };

  const getDealInsights = async (dealId: string) => {
    return await processAIRequest('analyze_document', {
      content: 'deal_insights',
      context: { 
        dealId,
        operationType: 'deal_insights'
      }
    });
  };

  const dealChatQuery = async (dealId: string, query: string) => {
    return await processAIRequest('explain_clause', {
      content: query,
      context: { 
        dealId,
        operationType: 'deal_chat'
      }
    });
  };

  return {
    summarizeDeal,
    predictDealHealth,
    getDealInsights,
    dealChatQuery,
    loading,
    error,
    result,
    clearResult
  };
};
