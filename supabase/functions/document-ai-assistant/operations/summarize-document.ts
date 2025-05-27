
export async function handleSummarizeDocument(
  content: string,
  dealId: string,
  documentId: string,
  documentVersionId: string,
  openai: any
) {
  try {
    // For contract analysis, content is provided directly
    if (dealId === 'contract-analysis') {
      const systemPrompt = `You are a legal document summarization assistant. Provide concise, structured summaries of legal documents.`;
      
      const userPrompt = `Please provide a comprehensive summary of this document:\n\n${content}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      });

      const summary = response.choices[0]?.message?.content || "Sorry, I couldn't generate a summary.";

      return {
        summary,
        disclaimer: "This AI-generated summary is for informational purposes only."
      };
    }

    // For regular deals, implement actual document fetching here
    return {
      summary: "Document summary functionality for regular deals not yet implemented.",
      disclaimer: "This feature is under development."
    };
  } catch (error) {
    console.error('Error in handleSummarizeDocument:', error);
    throw new Error('Failed to summarize document');
  }
}
