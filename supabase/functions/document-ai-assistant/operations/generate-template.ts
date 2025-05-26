
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleGenerateTemplate(
  content: string,
  dealId: string,
  userId: string,
  templateType: string,
  context: any,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a legal document template generator. Create a ${templateType} template based on the provided requirements.` 
        },
        { 
          role: "user", 
          content: `Generate a ${templateType} template with these requirements: ${content}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const template = response.choices[0]?.message?.content || "Sorry, I couldn't generate a template.";

    return {
      template,
      templateType,
      disclaimer: "This AI-generated template is for informational purposes only and should be reviewed by a qualified attorney."
    };
  } catch (error) {
    console.error('Error in generate template operation:', error);
    throw new Error('Failed to generate template');
  }
}
