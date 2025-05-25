
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleSummarizeDocument(
  content: string,
  dealId: string,
  documentId: string,
  documentVersionId: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    const summary = response.choices[0]?.message?.content || "Sorry, I couldn't generate a summary.";

    return {
      summary,
      disclaimer: "This AI-generated summary is for informational purposes only."
    };
  } catch (error) {
    console.error('Error in summarize document operation:', error);
    throw new Error('Failed to summarize document');
  }
}
