
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
- NO RTF commands like \\par or \\par\\par - use standard text formatting only
- Use underlines for document titles and section headers where appropriate
- Professional spacing with blank lines between major sections

TEXT FORMATTING:
- Use proper legal language and terminology
- Include placeholders in brackets like [INSERT BUYER NAME] or [INSERT AMOUNT]
- Proper capitalization for defined terms throughout the document
- Include reference to exhibits where applicable (e.g., "as specified in Exhibit A")
- Use "shall" for obligations and "may" for permissions
- DO NOT include any RTF, LaTeX, or special formatting commands

CONTENT STRUCTURE:
1. Document header with title and contract number placeholder
2. Opening paragraph identifying the parties
3. Main sections covering duties, terms, compensation, etc.
4. Proper legal clauses and provisions
5. Signature blocks at the end

CRITICAL: Generate clean text without any formatting codes like \\par, \\par\\par, or other markup. The template should look professional and match the formatting style of formal legal documents with proper spacing, indentation, and legal terminology.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
      // Clean up RTF/LaTeX commands that might slip through
      .replace(/\\par\\par/g, '\n\n')
      .replace(/\\par/g, '\n')
      .replace(/\\\\/g, '') // Remove other backslash commands
      // Remove any remaining \par commands (without backslash)
      .replace(/\bpar\b/g, '')
      // Ensure proper spacing between major sections (numbered)
      .replace(/(\d+\.\s+[A-Z][^.]*)\.\s*\n/g, '$1.\n\n')
      // Add spacing before major legal terms
      .replace(/\s+(WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF)/g, '\n\n$1')
      // Fix lettered subsections - remove unwanted line breaks after A., B., C., etc.
      .replace(/([A-Z]\.)\s*\n\s*/g, '$1 ')
      // Ensure numbered subsections have proper spacing
      .replace(/(\d+\)\s+)/g, '$1')
      // Clean up excessive whitespace but preserve intentional double line breaks
      .replace(/[ \t]{3,}/g, '  ')
      .replace(/\n{4,}/g, '\n\n\n')
      // Remove trailing spaces at end of lines
      .replace(/[ \t]+$/gm, '')
      // Ensure single space after periods in the middle of sentences
      .replace(/\.([A-Z])/g, '. $1')
      // Remove any remaining unwanted characters or formatting
      .replace(/[^\w\s\.\,\;\:\!\?\(\)\[\]\-\'\"\n]/g, '');
    
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
