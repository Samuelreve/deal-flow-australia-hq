
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
    
    // Build enhanced prompt with comprehensive deal context
    let prompt = `Generate a comprehensive ${templateType.toLowerCase()} template based on the following requirements:\n\n${content}\n\n`;
    
    // Add comprehensive deal information
    prompt += "DEAL INFORMATION:\n";
    if (context.dealTitle) prompt += `Deal Title: ${context.dealTitle}\n`;
    if (context.businessLegalName) prompt += `Business Legal Name: ${context.businessLegalName}\n`;
    if (context.businessTradingName) prompt += `Business Trading Name: ${context.businessTradingName}\n`;
    if (context.businessIndustry) prompt += `Industry: ${context.businessIndustry}\n`;
    if (context.businessState) prompt += `Business State: ${context.businessState}\n`;
    if (context.legalEntityType) prompt += `Legal Entity: ${context.legalEntityType}\n`;
    if (context.abn) prompt += `ABN: ${context.abn}\n`;
    if (context.acn) prompt += `ACN: ${context.acn}\n`;
    if (context.yearsInOperation) prompt += `Years in Operation: ${context.yearsInOperation}\n`;
    if (context.askingPrice) prompt += `Asking Price: $${context.askingPrice}\n`;
    if (context.dealType) prompt += `Deal Type: ${context.dealType}\n`;
    if (context.targetCompletionDate) prompt += `Target Completion: ${context.targetCompletionDate}\n`;
    if (context.keyAssetsIncluded) prompt += `Key Assets Included: ${context.keyAssetsIncluded}\n`;
    if (context.keyAssetsExcluded) prompt += `Key Assets Excluded: ${context.keyAssetsExcluded}\n`;
    if (context.reasonForSelling) prompt += `Reason for Selling: ${context.reasonForSelling}\n`;
    if (context.primarySellerName) prompt += `Primary Seller: ${context.primarySellerName}\n`;

    // Add uploaded documents information
    if (context.uploadedDocuments && context.uploadedDocuments.length > 0) {
      prompt += `\nUPLOADED DOCUMENTS (${context.uploadedDocuments.length} total):\n`;
      context.uploadedDocuments.forEach((doc: any, index: number) => {
        prompt += `${index + 1}. ${doc.filename} (Category: ${doc.category})\n`;
      });
    }

    // Add category-specific information
    if (context.ipAssets && context.ipAssets.length > 0) {
      prompt += `\nIP ASSETS:\n`;
      context.ipAssets.forEach((ip: any, index: number) => {
        prompt += `${index + 1}. ${ip.name} - ${ip.type} (${ip.description})\n`;
      });
    }
    
    if (context.propertyDetails) {
      prompt += `\nPROPERTY DETAILS:\n`;
      prompt += `Type: ${context.propertyDetails.propertyType}\n`;
      prompt += `Address: ${context.propertyDetails.address}\n`;
      if (context.propertyDetails.landSize) prompt += `Land Size: ${context.propertyDetails.landSize}\n`;
      if (context.propertyDetails.buildingArea) prompt += `Building Area: ${context.propertyDetails.buildingArea}\n`;
    }

    if (context.crossBorderDetails) {
      prompt += `\nCROSS-BORDER DETAILS:\n`;
      prompt += `Seller Country: ${context.crossBorderDetails.sellerCountry}\n`;
      prompt += `Buyer Country: ${context.crossBorderDetails.buyerCountry}\n`;
      if (context.crossBorderDetails.regulatoryApprovals) {
        prompt += `Regulatory Approvals Required: ${context.crossBorderDetails.regulatoryApprovals.join(', ')}\n`;
      }
    }

    if (context.microDealDetails) {
      prompt += `\nITEM DETAILS:\n`;
      prompt += `Item Name: ${context.microDealDetails.itemName}\n`;
      prompt += `Condition: ${context.microDealDetails.condition}\n`;
      if (context.microDealDetails.authenticity) prompt += `Authenticity: ${context.microDealDetails.authenticity}\n`;
      if (context.microDealDetails.provenance) prompt += `Provenance: ${context.microDealDetails.provenance}\n`;
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
- NO underlines or underscore placeholders (___) except for signature lines - use clear bracketed placeholders instead
- Professional spacing with blank lines between major sections

TEXT FORMATTING:
- Use proper legal language and terminology
- Include placeholders in brackets like [INSERT BUYER NAME] or [INSERT AMOUNT]
- NO underscores or underscore placeholders except for signature lines - use bracketed placeholders for everything else
- Proper capitalization for defined terms throughout the document
- Include reference to exhibits where applicable (e.g., "as specified in Exhibit A")
- Use "shall" for obligations and "may" for permissions
- DO NOT include any RTF, LaTeX, or special formatting commands

CONTENT STRUCTURE:
1. Document header with title and contract number placeholder
2. Opening paragraph identifying the parties
3. Main sections covering duties, terms, compensation, etc.
4. Proper legal clauses and provisions
5. Signature blocks at the end with underscores for signatures

SIGNATURE BLOCK REQUIREMENTS:
- Must include signature blocks for both SELLER and BUYER
- Use underscores directly in signature lines: "Signature: _____________________"
- Include Name, Title, and Date fields for each party
- Format example:
  SELLER:
  Signature: _____________________
  Name: [INSERT SELLER NAME]
  Title: [INSERT TITLE]
  Date: _____________________

  BUYER:
  Signature: _____________________
  Name: [INSERT BUYER NAME]  
  Title: [INSERT TITLE]
  Date: _____________________

CRITICAL: Generate clean text without any formatting codes like \\par, \\par\\par, or other markup. Use only bracketed placeholders like [INSERT NAME] except for signature lines which should use underscores like "Signature: ____________________". The template should look professional and match the formatting style of formal legal documents with proper spacing, indentation, and legal terminology.`;

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
      // Handle underscores: preserve signature lines, remove other placeholders
      // First, temporarily protect signature lines
      .replace(/(signature|sign|name|date|witness)[\s:]*_{3,}/gi, '$1: ____________________')
      // Remove remaining underscores that aren't for signatures
      .replace(/_{3,}/g, '[INSERT INFORMATION]')
      .replace(/\b_+\b/g, '[INSERT]')
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
      // Remove any remaining unwanted characters or formatting (but keep brackets)
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
