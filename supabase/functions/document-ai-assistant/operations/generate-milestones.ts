
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleGenerateMilestones(
  dealId: string,
  userId: string,
  context: any,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a deal management expert. Generate logical milestones for deal progression." 
        },
        { 
          role: "user", 
          content: "Generate a set of logical milestones for a business deal, including timelines and key deliverables." 
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const milestones = response.choices[0]?.message?.content || "Sorry, I couldn't generate milestones.";

    return {
      milestones,
      dealId,
      disclaimer: "These AI-generated milestones are suggestions and should be customized for your specific deal."
    };
  } catch (error) {
    console.error('Error in generate milestones operation:', error);
    throw new Error('Failed to generate milestones');
  }
}
