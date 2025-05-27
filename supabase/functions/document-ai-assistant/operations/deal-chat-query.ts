
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { fetchDealContextData, getSupabaseAdmin } from "./utils/deal-context-fetcher.ts";
import { formatDealContextForPrompt } from "./utils/deal-context-formatter.ts";

export async function handleDealChatQuery(
  dealId: string,
  userId: string,
  content: string,
  chatHistory: any[],
  openai: any
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch comprehensive deal data for context
    const dealContext = await fetchDealContextData(dealId);
    
    // Format the context for the AI prompt
    const formattedContext = formatDealContextForPrompt(dealContext);
    
    // Format chat history if provided
    let conversationHistory = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationHistory = '\nPrevious conversation:\n';
      chatHistory.slice(-5).forEach((msg: any) => { // Only include last 5 messages
        conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationHistory += '\n';
    }
    
    // Construct the prompt for the AI
    const promptContent = `You are a helpful, deal-specific assistant for the DealPilot platform. Your goal is to answer user questions about the current deal based ONLY on the provided context.

Deal Context:
${formattedContext}
${conversationHistory}

User's Question:
${content}

Important Rules:
1. Answer the user's question concisely and directly.
2. Base your answer **ONLY** on the 'Deal Context' provided. Do NOT invent information or speculate.
3. If the answer is NOT explicitly available in the provided 'Deal Context', state clearly: 'I do not have enough information in the provided deal context to answer that question.' Do NOT make up information.
4. Do NOT provide legal advice, financial advice, or personal opinions.
5. Keep your answer brief and to the point.
6. If referring to specific dates, format them in a user-friendly way.
7. Be conversational but professional.
8. Include the following disclaimer at the very end of your response: 'Disclaimer: This tool provides general information based on deal data, not professional advice. Always consult qualified professionals for final review.'`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that answers questions based on provided deal context. Always be accurate and don't make up information." 
        },
        { role: "user", content: promptContent }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const answer = completion.choices[0]?.message?.content || 'I apologize, but I could not generate an answer at this time.';

    return {
      success: true,
      answer: answer,
      response: answer // Also include as 'response' for compatibility
    };

  } catch (error) {
    console.error('Error in handleDealChatQuery:', error);
    throw new Error(`Failed to process deal chat query: ${error.message}`);
  }
}
