
export async function handleSummarizeDocument(
  content: string,
  dealId: string,
  documentId: string,
  documentVersionId: string,
  openai: any // We'll use fetch instead of the openai client
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
            content: "You are a document analysis expert. Provide a comprehensive but concise summary of the document." 
          },
          { 
            role: "user", 
            content: `Please summarize this document: ${content}` 
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content || "Sorry, I couldn't generate a summary.";

    return {
      summary,
      disclaimer: "This AI-generated summary is for informational purposes only."
    };
  } catch (error) {
    console.error('Error in summarize document operation:', error);
    throw new Error('Failed to summarize document');
  }
}
