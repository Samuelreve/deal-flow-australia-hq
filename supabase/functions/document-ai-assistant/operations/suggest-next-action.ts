
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleSuggestNextAction(
  dealId: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a deal management expert. Suggest practical next actions for deal progression." 
        },
        { 
          role: "user", 
          content: "Based on typical deal processes, suggest the next logical actions to progress this deal." 
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    });

    const suggestion = response.choices[0]?.message?.content || "Sorry, I couldn't generate suggestions.";

    return {
      suggestion,
      dealId,
      disclaimer: "These AI-generated suggestions are for guidance only."
    };
  } catch (error) {
    console.error('Error in suggest next action operation:', error);
    throw new Error('Failed to suggest next action');
  }
}
