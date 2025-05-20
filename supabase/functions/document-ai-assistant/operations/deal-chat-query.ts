
import { getUserDealRole } from "../../_shared/rbac.ts";
import { fetchDealContextData } from "./utils/deal-context-fetcher.ts";
import { formatDealContextForPrompt } from "./utils/deal-context-formatter.ts";
import { prepareChatMessages } from "./utils/deal-chat-prompt.ts";

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
    
    // Format context for the AI prompt
    const formattedContext = formatDealContextForPrompt(dealContext);
    
    // Prepare messages for the OpenAI API
    const messages = prepareChatMessages(formattedContext, userQuery, chatHistory);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using more efficient model
      messages: messages,
      temperature: 0.1, // Keep temperature low for factual responses
      max_tokens: 500 // Reasonable limit for response length
    });
    
    const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate an answer.";
    
    return {
      answer: answer,
      disclaimer: "This is an AI-generated response based on the information available about this deal. It should not be considered legal, financial, or professional advice."
    };
  } catch (error) {
    console.error("Error in deal chat query:", error);
    throw new Error(`Failed to process deal chat query: ${error.message}`);
  }
}
