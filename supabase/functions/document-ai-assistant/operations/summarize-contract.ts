
/**
 * Handler for summarizing contract documents using OpenAI
 */
export async function summarizeContractOperation(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  userId: string
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
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a legal document analysis expert. Provide comprehensive contract summaries in plain English." 
          },
          { 
            role: "user", 
            content: "Please provide a detailed summary of this contract document, highlighting key terms, obligations, and important clauses." 
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content || "Sorry, I couldn't generate a contract summary.";

    return {
      summary,
      disclaimer: "This AI-generated contract summary is for informational purposes only and should not be considered legal advice."
    };
  } catch (error) {
    console.error('Error in summarize contract operation:', error);
    throw new Error('Failed to summarize contract');
  }
}

/**
 * Main handler for contract summarization requests
 */
export async function handleSummarizeContract(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  userId: string,
  openai: any // We'll use fetch instead of the openai client
) {
  try {
    return await summarizeContractOperation(dealId, documentId, documentVersionId, userId);
  } catch (error: any) {
    console.error('Error in handleSummarizeContract:', error);
    throw error;
  }
}
