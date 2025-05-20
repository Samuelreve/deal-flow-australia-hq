
import { getUserDealRole } from "../../_shared/rbac.ts";
import { fetchDealContextData } from "./utils/deal-context-fetcher.ts";
import { processChatQuery } from "./utils/deal-chat-processor.ts";

/**
 * Handle deal chat query operation
 */
export async function handleDealChatQuery(
  dealId: string, 
  userId: string, 
  userQuery: string, 
  chatHistory: Array<{sender: string, content: string}> = [],
  openai: any
) {
  try {
    // Verify user is a participant in the deal
    try {
      await getUserDealRole(userId, dealId);
    } catch (error) {
      throw new Error(`Authorization error: ${error.message}`);
    }
    
    // Fetch comprehensive deal context
    const dealContext = await fetchDealContextData(dealId);
    
    // Process the chat query and get answer
    const answer = await processChatQuery(dealContext, userQuery, chatHistory, openai);
    
    return {
      answer: answer,
      disclaimer: "This is an AI-generated response based on the information available about this deal. It should not be considered legal, financial, or professional advice."
    };
  } catch (error) {
    console.error("Error in deal chat query:", error);
    throw new Error(`Failed to process deal chat query: ${error.message}`);
  }
}
