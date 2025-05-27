
export async function handleGenerateTemplate(
  content: string,
  dealId: string,
  userId: string,
  templateType: string,
  context: any,
  openai: any
) {
  try {
    const systemPrompt = `You are a legal document template generator. Create professional ${templateType} templates based on the provided requirements.`;
    
    const userPrompt = `Create a ${templateType} template with these requirements: ${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const template = response.choices[0]?.message?.content || "Sorry, I couldn't generate a template.";

    return {
      template,
      disclaimer: "This AI-generated template is for informational purposes only and should be reviewed by a legal professional."
    };
  } catch (error) {
    console.error('Error in handleGenerateTemplate:', error);
    throw new Error('Failed to generate template');
  }
}
