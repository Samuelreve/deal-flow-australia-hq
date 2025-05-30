
export async function handleGenerateTemplate(
  content: string,
  dealId: string,
  userId: string,
  templateType: string = 'Contract',
  context: any = {},
  openai: any
) {
  try {
    console.log('Generating template for deal:', dealId, 'type:', templateType);
    
    // Build enhanced prompt with context
    let prompt = `Generate a comprehensive ${templateType.toLowerCase()} template based on the following requirements:\n\n${content}\n\n`;
    
    if (context.dealTitle) {
      prompt += `Deal Title: ${context.dealTitle}\n`;
    }
    if (context.businessName) {
      prompt += `Business Name: ${context.businessName}\n`;
    }
    if (context.askingPrice) {
      prompt += `Asking Price: $${context.askingPrice}\n`;
    }
    if (context.dealType) {
      prompt += `Deal Type: ${context.dealType}\n`;
    }
    if (context.businessIndustry) {
      prompt += `Industry: ${context.businessIndustry}\n`;
    }
    
    prompt += `\nPlease generate a professional, legally-structured ${templateType.toLowerCase()} template that includes:
1. Standard legal clauses and provisions
2. Clear terms and conditions
3. Proper legal formatting
4. Placeholders for specific details that need to be filled in
5. Industry-appropriate language and requirements

The template should be comprehensive but editable, allowing for customization based on specific deal requirements.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a legal document expert specializing in business sale contracts and agreements. Generate professional, comprehensive contract templates with proper legal structure and language.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const template = response.choices[0]?.message?.content;
    
    if (!template) {
      throw new Error('No template generated from AI response');
    }

    return {
      success: true,
      template,
      templateType,
      dealId,
      generatedAt: new Date().toISOString(),
      disclaimer: 'This template is AI-generated and should be reviewed by legal professionals before use.'
    };
  } catch (error: any) {
    console.error('Error generating template:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate template',
      templateType,
      dealId
    };
  }
}
