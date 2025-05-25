
/**
 * Handler for explaining specific contract clauses using OpenAI
 */
export async function explainContractClauseOperation(
  dealId: string,
  userId: string,
  clauseText: string
) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use direct fetch to bypass any project association
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a legal expert who explains contract clauses in simple, clear language. Break down complex legal terms and explain their practical implications." 
          },
          { 
            role: "user", 
            content: `Please explain this contract clause in plain English: "${clauseText}"` 
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0]?.message?.content || "Sorry, I couldn't explain this clause.";

    return {
      explanation,
      disclaimer: "This explanation is for informational purposes only and should not be considered legal advice. Always consult with a qualified attorney for legal matters."
    };
  } catch (error) {
    console.error('Error in explain contract clause operation:', error);
    throw new Error('Failed to explain contract clause');
  }
}

/**
 * Main handler for contract clause explanation requests
 */
export async function handleExplainContractClause(
  dealId: string,
  userId: string,
  clauseText: string,
  openai: any // We'll use fetch instead of the openai client
) {
  try {
    return await explainContractClauseOperation(dealId, userId, clauseText);
  } catch (error: any) {
    console.error('Error in handleExplainContractClause:', error);
    throw error;
  }
}
