
export async function handleDealChatQuery(
  dealId: string,
  userId: string,
  query: string,
  chatHistory: any[],
  openai: any
) {
  try {
    if (!query || query.trim().length === 0) {
      return {
        answer: 'Please provide a question about your deal.',
        chatResponse: 'No query provided.',
        disclaimer: 'Deal chat requires a valid question.'
      };
    }

    // Use OpenAI for real AI responses
    const systemPrompt = `You are an AI assistant specialized in deal management and business transactions. You have access to deal information and can provide helpful insights about:

- Deal progress and health analysis
- Next actions and recommendations
- Document analysis and requirements
- Industry insights and benchmarking
- Risk assessment and mitigation strategies

Provide helpful, actionable responses based on the user's query about their deal. Be concise but informative.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Deal ID: ${dealId}\nUser Query: ${query}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

    return {
      answer,
      chatResponse: answer,
      sources: [],
      disclaimer: 'AI-generated response based on general business knowledge. Please verify important decisions with qualified professionals.'
    };
  } catch (error) {
    console.error('Error in handleDealChatQuery:', error);
    throw new Error('Failed to process chat query');
  }
}
