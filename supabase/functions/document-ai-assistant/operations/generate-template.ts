import { DOCUMENT_GENERATION_SYSTEM_PROMPT, AUSTRALIAN_LEGAL_CONTEXT } from '../../_shared/ai-prompts.ts';

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
    
    // Build comprehensive deal context for the AI
    let dealContext = "## CURRENT DEAL CONTEXT\n\n";
    
    // Core deal information
    dealContext += "### TRANSACTION DETAILS\n";
    if (context.dealTitle) dealContext += `- **Deal Title**: ${context.dealTitle}\n`;
    if (context.dealType) dealContext += `- **Deal Type**: ${context.dealType}\n`;
    if (context.askingPrice) dealContext += `- **Asking Price**: $${Number(context.askingPrice).toLocaleString()} AUD\n`;
    if (context.targetCompletionDate) dealContext += `- **Target Completion**: ${context.targetCompletionDate}\n`;
    
    // Business information
    dealContext += "\n### BUSINESS INFORMATION\n";
    if (context.businessLegalName) dealContext += `- **Legal Name**: ${context.businessLegalName}\n`;
    if (context.businessTradingName) dealContext += `- **Trading Name**: ${context.businessTradingName}\n`;
    if (context.businessIndustry) dealContext += `- **Industry**: ${context.businessIndustry}\n`;
    if (context.businessState) dealContext += `- **State**: ${context.businessState}\n`;
    if (context.legalEntityType) dealContext += `- **Entity Type**: ${context.legalEntityType}\n`;
    if (context.abn) dealContext += `- **ABN**: ${context.abn}\n`;
    if (context.acn) dealContext += `- **ACN**: ${context.acn}\n`;
    if (context.yearsInOperation) dealContext += `- **Years in Operation**: ${context.yearsInOperation}\n`;
    
    // Parties
    dealContext += "\n### PARTIES TO THE TRANSACTION\n";
    if (context.primarySellerName) dealContext += `- **Seller**: ${context.primarySellerName}\n`;
    if (context.buyerName) dealContext += `- **Buyer**: ${context.buyerName}\n`;
    
    // Assets
    dealContext += "\n### ASSETS & EXCLUSIONS\n";
    if (context.keyAssetsIncluded) dealContext += `- **Included Assets**: ${context.keyAssetsIncluded}\n`;
    if (context.keyAssetsExcluded) dealContext += `- **Excluded Assets**: ${context.keyAssetsExcluded}\n`;
    if (context.reasonForSelling) dealContext += `- **Reason for Sale**: ${context.reasonForSelling}\n`;

    // Uploaded documents
    if (context.uploadedDocuments && context.uploadedDocuments.length > 0) {
      dealContext += `\n### DEAL DOCUMENTS (${context.uploadedDocuments.length} uploaded)\n`;
      context.uploadedDocuments.forEach((doc: any, index: number) => {
        dealContext += `${index + 1}. ${doc.filename} (${doc.category})\n`;
      });
    }

    // Category-specific: IP Assets
    if (context.ipAssets && context.ipAssets.length > 0) {
      dealContext += `\n### INTELLECTUAL PROPERTY ASSETS\n`;
      context.ipAssets.forEach((ip: any, index: number) => {
        dealContext += `${index + 1}. **${ip.name}** (${ip.type}): ${ip.description}\n`;
      });
    }
    
    // Category-specific: Property
    if (context.propertyDetails) {
      dealContext += `\n### REAL PROPERTY DETAILS\n`;
      dealContext += `- **Type**: ${context.propertyDetails.propertyType}\n`;
      dealContext += `- **Address**: ${context.propertyDetails.address}\n`;
      if (context.propertyDetails.landSize) dealContext += `- **Land Size**: ${context.propertyDetails.landSize}\n`;
      if (context.propertyDetails.buildingArea) dealContext += `- **Building Area**: ${context.propertyDetails.buildingArea}\n`;
    }

    // Category-specific: Cross-border
    if (context.crossBorderDetails) {
      dealContext += `\n### CROSS-BORDER TRANSACTION DETAILS\n`;
      dealContext += `- **Seller Country**: ${context.crossBorderDetails.sellerCountry}\n`;
      dealContext += `- **Buyer Country**: ${context.crossBorderDetails.buyerCountry}\n`;
      if (context.crossBorderDetails.regulatoryApprovals) {
        dealContext += `- **Regulatory Approvals Required**: ${context.crossBorderDetails.regulatoryApprovals.join(', ')}\n`;
      }
    }

    // Category-specific: Micro deals
    if (context.microDealDetails) {
      dealContext += `\n### ITEM DETAILS\n`;
      dealContext += `- **Item Name**: ${context.microDealDetails.itemName}\n`;
      dealContext += `- **Condition**: ${context.microDealDetails.condition}\n`;
      if (context.microDealDetails.authenticity) dealContext += `- **Authenticity**: ${context.microDealDetails.authenticity}\n`;
      if (context.microDealDetails.provenance) dealContext += `- **Provenance**: ${context.microDealDetails.provenance}\n`;
    }

    // Build the comprehensive system prompt
    const systemPrompt = `${DOCUMENT_GENERATION_SYSTEM_PROMPT}

${AUSTRALIAN_LEGAL_CONTEXT}

${dealContext}

## DOCUMENT GENERATION INSTRUCTIONS

You are generating a **${templateType}** for this transaction.

**Requirements:**
1. Use ALL the deal context above - include actual names, amounts, dates, and specifics
2. Apply Australian legal standards and cite relevant legislation where appropriate
3. Use industry-appropriate language for ${context.businessIndustry || 'general business'}
4. Generate a comprehensive, professionally formatted document
5. Include proper signature blocks for Australian execution (Corporations Act s127)
6. Add Australian-specific clauses (GST, Privacy Act compliance, governing law)

**Formatting Requirements:**
- Start with a clear document title in ALL CAPS
- Use numbered sections (1., 2., 3., etc.) for main headings
- Use lettered subsections (a), b), c)) for sub-clauses
- Include proper legal paragraph structure
- Use placeholders in brackets like [INSERT BUYER NAME] only for truly unknown information
- Include signature blocks at the end
- NO markdown formatting (asterisks, hash symbols)
- Clean, professional text suitable for legal review

${content ? `\n**Additional User Requirements:**\n${content}` : ''}`;

    // User message is simple - the context is in the system prompt
    const userMessage = `Generate a comprehensive ${templateType} document for this transaction. 
    
Ensure the document:
- Is ready for legal review
- Uses all available deal information
- Follows Australian legal standards
- Is appropriately detailed for the deal size${context.askingPrice ? ` ($${Number(context.askingPrice).toLocaleString()})` : ''}
- Includes industry-specific provisions for ${context.businessIndustry || 'the relevant industry'}`;

    console.log('Using comprehensive DOCUMENT_GENERATION_SYSTEM_PROMPT with AUSTRALIAN_LEGAL_CONTEXT');
    console.log('System prompt length:', systemPrompt.length, 'characters');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 8000, // Increased from 2000 to allow longer, more comprehensive documents
      temperature: 0.3
    });

    let template = response.choices[0]?.message?.content;
    
    if (!template) {
      throw new Error('No template generated from AI response');
    }

    console.log('Template generated successfully, length:', template.length, 'characters');

    // Post-process the template to ensure proper professional formatting
    template = template
      // Remove markdown formatting
      .replace(/\*{2,}/g, '')
      .replace(/#{1,}\s*/g, '')
      .replace(/\*([^*]+)\*/g, '$1')
      // Handle underscores: preserve signature lines, remove other placeholders
      .replace(/(signature|sign)[\s:]*_{3,}/gi, '$1: %%SIGNATURE_LINE%%')
      .replace(/(date)[\s:]*_{3,}/gi, '$1: %%DATE_LINE%%')
      // Remove remaining underscores that aren't for signatures  
      .replace(/_{3,}/g, '[INSERT INFORMATION]')
      .replace(/\b_+\b/g, '[INSERT]')
      // Restore protected signature and date lines
      .replace(/%%SIGNATURE_LINE%%/g, '_____________________')
      .replace(/%%DATE_LINE%%/g, '_____________________')
      // Clean up RTF/LaTeX commands that might slip through
      .replace(/\\par\\par/g, '\n\n')
      .replace(/\\par/g, '\n')
      .replace(/\\\\/g, '')
      .replace(/\bpar\b/g, '')
      // Ensure proper spacing between major sections
      .replace(/(\d+\.\s+[A-Z][^.]*)\.\s*\n/g, '$1.\n\n')
      // Add spacing before major legal terms
      .replace(/\s+(WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF)/g, '\n\n$1')
      // Fix lettered subsections
      .replace(/([A-Z]\.)\s*\n\s*/g, '$1 ')
      // Clean up excessive whitespace
      .replace(/[ \t]{3,}/g, '  ')
      .replace(/\n{4,}/g, '\n\n\n')
      // Remove trailing spaces
      .replace(/[ \t]+$/gm, '')
      // Ensure single space after periods
      .replace(/\.([A-Z])/g, '. $1');
    
    template = template.trim();

    return {
      success: true,
      template,
      templateType,
      dealId,
      generatedAt: new Date().toISOString(),
      promptUsed: 'DOCUMENT_GENERATION_SYSTEM_PROMPT + AUSTRALIAN_LEGAL_CONTEXT',
      disclaimer: 'This document has been AI-generated using Australian legal standards and should be reviewed by qualified legal professionals before execution.'
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
