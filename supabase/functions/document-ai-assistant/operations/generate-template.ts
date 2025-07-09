
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

FORMATTING REQUIREMENTS:
- Use proper paragraph breaks and line spacing
- Use numbered sections (1., 2., 3.) and lettered subsections (a., b., c.)
- Use professional indentation and spacing
- NO asterisks (*) or hash symbols (#) for formatting
- Use proper legal document structure with clear headings
- Include blank lines between sections for readability
- Use standard legal document formatting conventions

CONTENT REQUIREMENTS:
1. Standard legal clauses and provisions
2. Clear terms and conditions with proper numbering
3. Placeholders in brackets [Insert Information Here]
4. Industry-appropriate language and requirements
5. Professional document structure with clear sections

The template should be comprehensive, properly formatted, and editable for specific deal requirements.`;

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

    let template = response.choices[0]?.message?.content;
    
    if (!template) {
      throw new Error('No template generated from AI response');
    }

    // Post-process the template to ensure proper formatting
    template = template
      // Remove multiple asterisks and hash symbols
      .replace(/\*{2,}/g, '')
      .replace(/#{1,}/g, '')
      .replace(/\*([^*]+)\*/g, '$1') // Remove single asterisks around text
      // Ensure proper line breaks after periods and sections
      .replace(/\.\s*([A-Z])/g, '.\n\n$1')
      // Fix paragraph spacing
      .replace(/\\par\\par/g, '\n\n')
      .replace(/\\par/g, '\n')
      // Clean up extra whitespace
      .replace(/\s{3,}/g, '  ')
      // Ensure proper section numbering format
      .replace(/(\d+\.)\s*([A-Z])/g, '$1 $2');
    
    // Ensure the template starts with proper formatting
    template = template.trim();

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
