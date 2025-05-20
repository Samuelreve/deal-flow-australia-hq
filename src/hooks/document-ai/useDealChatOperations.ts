
import { AIResponse } from './useDocumentAIBase';
import { ChatMessage } from './types';

interface UseDealChatOperationsProps {
  processAIRequest: (operation: string, options: any) => Promise<AIResponse | null>;
}

/**
 * Hook for deal chat operations
 */
export const useDealChatOperations = ({ processAIRequest }: UseDealChatOperationsProps) => {
  /**
   * Send a chat query to the AI and get a response
   */
  const dealChatQuery = async (
    dealId: string,
    userQuery: string,
    chatHistory: ChatMessage[] = []
  ): Promise<AIResponse | null> => {
    return processAIRequest('deal_chat_query', {
      content: userQuery,
      dealId,
      context: {},
      chatHistory
    });
  };

  return {
    dealChatQuery
  };
};
