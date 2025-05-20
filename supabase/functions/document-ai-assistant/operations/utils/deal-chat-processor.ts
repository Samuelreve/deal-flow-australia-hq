
import { prepareChatMessages } from "./deal-chat-prompt.ts";
import { fetchDealContextData } from "./deal-context-fetcher.ts";
import { formatDealContextForPrompt } from "./deal-context-formatter.ts";

/**
 * Process a chat query with OpenAI
 */
export async function processChatQuery(
  dealContext: any, 
  userQuery: string, 
  chatHistory: Array<{sender: string, content: string}> = [],
  openai: any
) {
  try {
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
    
    return answer;
  } catch (error) {
    console.error("Error in processing chat query:", error);
    throw new Error(`Failed to process chat query: ${error.message}`);
  }
}
