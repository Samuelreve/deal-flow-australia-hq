
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleExplainClause(
  content: string,
  context: any,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a legal expert. Explain the given clause in simple, clear terms." 
        },
        { 
          role: "user", 
          content: `Please explain this clause: ${content}` 
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const explanation = response.choices[0]?.message?.content || "Sorry, I couldn't generate an explanation.";

    return {
      explanation,
      disclaimer: "This AI-generated explanation is for informational purposes only and does not constitute legal advice."
    };
  } catch (error) {
    console.error('Error in explain clause operation:', error);
    throw new Error('Failed to explain clause');
  }
}
