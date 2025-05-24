
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleGetDealInsights(
  userId: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a business intelligence expert. Provide insights about deal performance and trends." 
        },
        { 
          role: "user", 
          content: "Provide insights about deal performance, potential risks, and opportunities for improvement." 
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const insights = response.choices[0]?.message?.content || "Sorry, I couldn't generate insights.";

    return {
      insights,
      userId,
      disclaimer: "These AI-generated insights are for informational purposes only."
    };
  } catch (error) {
    console.error('Error in get deal insights operation:', error);
    throw new Error('Failed to get deal insights');
  }
}
