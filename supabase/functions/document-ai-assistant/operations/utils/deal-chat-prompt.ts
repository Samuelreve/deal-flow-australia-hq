import { DEAL_CHAT_SYSTEM_PROMPT } from "../../_shared/ai-prompts.ts";

/**
 * Build system prompt for the deal chat AI
 */
export function buildDealChatSystemPrompt(): string {
  return DEAL_CHAT_SYSTEM_PROMPT;
}

/**
 * Format the chat history and context for the AI prompt
 */
export function prepareChatMessages(
  dealContext: string,
  userQuery: string,
  chatHistory: Array<{sender: string, content: string}> = []
): Array<{role: string, content: string}> {
  // Start with system prompt
  const messages = [
    { role: "system", content: buildDealChatSystemPrompt() },
  ];
  
  // Add chat history for context if provided (limit to reasonable number)
  const recentHistory = chatHistory.slice(-4); // Only use the last 4 messages for context
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant', 
      content: msg.content
    });
  });
  
  // Add the current context and query
  messages.push({
    role: "user", 
    content: `Deal Context:\n${dealContext}\n\nUser's Question: ${userQuery}`
  });
  
  return messages;
}
