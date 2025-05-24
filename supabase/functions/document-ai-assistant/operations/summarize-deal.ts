
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleSummarizeDeal(
  dealId: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a deal analysis expert. Provide comprehensive deal summaries." 
        },
        { 
          role: "user", 
          content: "Provide a comprehensive summary of this deal including key terms, status, and important considerations." 
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    const summary = response.choices[0]?.message?.content || "Sorry, I couldn't generate a deal summary.";

    return {
      summary,
      dealId,
      disclaimer: "This AI-generated summary is for informational purposes only."
    };
  } catch (error) {
    console.error('Error in summarize deal operation:', error);
    throw new Error('Failed to summarize deal');
  }
}
