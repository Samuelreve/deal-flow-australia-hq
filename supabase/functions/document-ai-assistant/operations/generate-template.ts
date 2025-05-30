
export async function handleGenerateTemplate(
  content: string,
  dealId: string,
  userId: string,
  templateType: string,
  context: any,
  openai: any
) {
  try {
    const systemPrompt = `You are a legal document template generator. Create professional ${templateType} templates based on the provided requirements and deal context.

Guidelines:
- Generate complete, professional templates
- Include all standard clauses and terms
- Use placeholders like [BUYER NAME], [SELLER NAME], [PURCHASE PRICE] where specific information is needed
- Ensure the template is legally sound and comprehensive
- Format the document professionally with clear sections and headings`;
    
    const userPrompt = `Create a ${templateType} template for a business sale with these details:
    
Business Information:
- Business Name: ${context.businessName || '[BUSINESS NAME]'}
- Deal Type: ${context.dealType || 'Business Sale'}
- Industry: ${context.businessIndustry || '[INDUSTRY]'}
- Asking Price: ${context.askingPrice ? `$${context.askingPrice}` : '[PURCHASE PRICE]'}

Requirements: ${content}

Please generate a comprehensive contract template that includes:
1. Party identification sections
2. Purchase price and payment terms
3. Assets included/excluded
4. Warranties and representations
5. Closing conditions
6. Standard legal clauses

Format the template professionally with clear sections and use placeholders for information that needs to be filled in.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const template = response.choices[0]?.message?.content || "Sorry, I couldn't generate a template.";

    return {
      template,
      disclaimer: "This AI-generated template is for informational purposes only and should be reviewed by a legal professional before use."
    };
  } catch (error) {
    console.error('Error in handleGenerateTemplate:', error);
    throw new Error('Failed to generate template');
  }
}
