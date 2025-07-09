
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
    
    prompt += `\nPlease generate a professional, legally-structured ${templateType.toLowerCase()} template following this exact format:

DOCUMENT STRUCTURE REQUIREMENTS:
- Start with a clear document title in ALL CAPS and underlined
- Use numbered main sections (1., 2., 3., etc.)
- Use lettered subsections (A., B., C., D., etc.) with proper indentation
- Use numbered sub-subsections (1), 2), 3)) when needed
- Include "Contract No." header if it's a contract
- Add proper spacing: double line breaks between sections, single line breaks within sections

FORMATTING REQUIREMENTS:
- Use ALL CAPS for key defined terms (e.g., BUYER, SELLER, AGREEMENT)
- Proper paragraph indentation for subsections
- Clear section titles like "DUTIES", "COMPENSATION", "TERMS AND CONDITIONS"
- NO asterisks (*), hash symbols (#), or markdown formatting
- Use underlines for document titles and section headers where appropriate
- Professional spacing with blank lines between major sections

TEXT FORMATTING:
- Use proper legal language and terminology
- Include placeholders in brackets like [INSERT BUYER NAME] or [INSERT AMOUNT]
- Proper capitalization for defined terms throughout the document
- Include reference to exhibits where applicable (e.g., "as specified in Exhibit A")
- Use "shall" for obligations and "may" for permissions

CONTENT STRUCTURE:
1. Document header with title and contract number placeholder
2. Opening paragraph identifying the parties
3. Main sections covering duties, terms, compensation, etc.
4. Proper legal clauses and provisions
5. Signature blocks at the end

The template should look professional and match the formatting style of formal legal documents with proper spacing, indentation, and legal terminology.`;

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

    // Post-process the template to ensure proper professional formatting
    template = template
      // Remove multiple asterisks and hash symbols
      .replace(/\*{2,}/g, '')
      .replace(/#{1,}/g, '')
      .replace(/\*([^*]+)\*/g, '$1') // Remove single asterisks around text
      // Ensure proper paragraph breaks and spacing
      .replace(/\\par\\par/g, '\n\n')
      .replace(/\\par/g, '\n')
      // Add proper spacing after sentences ending with periods
      .replace(/\.\s+([A-Z][^.]*:)/g, '.\n\n$1') // Section headers
      .replace(/\.\s+(\d+\.)/g, '.\n\n$1') // Numbered sections
      .replace(/\.\s+([A-Z]\.))/g, '.\n\n$1') // Lettered subsections
      // Ensure proper spacing around main sections
      .replace(/(\d+\.\s+[A-Z][^.]*\.)\s*/g, '$1\n\n')
      // Ensure proper spacing around subsections
      .replace(/([A-Z]\.\s+[^.]*\.)\s*/g, '$1\n')
      // Add proper spacing before WHEREAS, NOW THEREFORE, etc.
      .replace(/\s+(WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF)/g, '\n\n$1')
      // Clean up excessive whitespace but preserve intentional spacing
      .replace(/[ \t]{3,}/g, '  ')
      .replace(/\n{4,}/g, '\n\n\n')
      // Ensure consistent spacing after colons in section headers
      .replace(/([A-Z][^:]*:)\s*/g, '$1\n')
      // Ensure proper indentation for subsections
      .replace(/^([A-Z]\.\s+)/gm, '    $1')
      // Ensure proper indentation for sub-subsections
      .replace(/^(\d+\)\s+)/gm, '        $1');
    
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
