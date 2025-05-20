
/**
 * Build system prompt for the deal chat AI
 */
export function buildDealChatSystemPrompt(): string {
  return `You are a helpful, deal-specific assistant for the DealPilot platform. Your goal is to answer user questions about the current deal based ONLY on the provided context.

**Important Rules:**
1. Answer the user's question concisely and directly.
2. Base your answer **ONLY** on the information provided in the 'Deal Context'.
3. If the answer is NOT explicitly available in the provided 'Deal Context', state clearly: 'I do not have enough information in the current deal context to answer that question.' Do NOT make up information or speculate.
4. Do NOT provide legal advice, financial advice, or personal opinions.
5. Keep your answer brief and to the point.`;
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
