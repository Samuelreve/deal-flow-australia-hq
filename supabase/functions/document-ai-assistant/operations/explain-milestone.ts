
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleExplainMilestone(
  dealId: string,
  milestoneId: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a business process expert. Explain milestones and their importance in deal management." 
        },
        { 
          role: "user", 
          content: `Explain the importance and implications of this milestone in the deal process.` 
        }
      ],
      temperature: 0.2,
      max_tokens: 600
    });

    const explanation = response.choices[0]?.message?.content || "Sorry, I couldn't generate an explanation.";

    return {
      explanation,
      milestoneId,
      disclaimer: "This AI-generated explanation is for informational purposes only."
    };
  } catch (error) {
    console.error('Error in explain milestone operation:', error);
    throw new Error('Failed to explain milestone');
  }
}
