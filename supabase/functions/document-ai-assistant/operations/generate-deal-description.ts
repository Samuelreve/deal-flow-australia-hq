import { fetchDealContextData } from './utils/deal-context-fetcher.ts';

export async function handleGenerateDealDescription(
  dealId: string,
  tempDealId: string,
  openai: any,
  dealData: any
) {
  try {
    console.log(`🎯 Starting deal description generation for deal ${dealId || tempDealId}`);
    
    let dealContext = null;
    let documents = [];
    
    // Try to fetch existing deal context if dealId exists
    if (dealId && dealId !== tempDealId) {
      try {
        dealContext = await fetchDealContextData(dealId);
        documents = dealContext.documents || [];
      } catch (error) {
        console.log('No existing deal context found, using provided data');
      }
    }
    
    // Fetch documents for temp deal if no real deal exists
    if (documents.length === 0 && tempDealId) {
      // Query documents associated with temp deal
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );
      
      const { data: tempDocuments } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          type,
          category,
          description,
          document_versions!inner(
            text_content,
            version_number
          )
        `)
        .eq('deal_id', tempDealId)
        .order('created_at', { ascending: false });
        
      documents = tempDocuments || [];
    }
    
    // Extract and analyze document content
    let documentInsights = '';
    if (documents.length > 0) {
      const documentSummaries = documents.map(doc => {
        const latestVersion = doc.document_versions?.[0];
        const content = latestVersion?.text_content || '';
        
        // Extract key information from document content
        const contentPreview = content.length > 500 ? content.substring(0, 500) + '...' : content;
        
        return {
          name: doc.name,
          type: doc.type,
          category: doc.category,
          contentPreview,
          hasFinancialData: /revenue|income|profit|sales|financial|earnings|cash flow/i.test(content),
          hasOperationalData: /operations?|process|workflow|staff|employees|customers/i.test(content),
          hasLegalData: /legal|contract|agreement|compliance|regulation/i.test(content)
        };
      });
      
      documentInsights = `
Document Analysis:
${documentSummaries.map(doc => `
• ${doc.name} (${doc.type}):
  ${doc.contentPreview}
  Contains: ${[
    doc.hasFinancialData && 'Financial data',
    doc.hasOperationalData && 'Operational details', 
    doc.hasLegalData && 'Legal information'
  ].filter(Boolean).join(', ') || 'General business information'}
`).join('\n')}`;
    }
    
    // Create comprehensive prompt incorporating all available data
    const prompt = `You are an expert business broker helping to create a compelling deal description. Generate a professional, detailed description that will attract serious buyers.

Business Information:
- Business Name: ${dealData.businessTradingName || dealData.businessLegalName || 'Not specified'}
- Legal Name: ${dealData.businessLegalName || 'Not specified'}
- Industry: ${dealData.businessIndustry || 'Not specified'}
- Years in Operation: ${dealData.yearsInOperation || 'Not specified'}
- Deal Type: ${dealData.dealType || 'Not specified'}
- Asking Price: ${dealData.askingPrice ? `$${Number(dealData.askingPrice).toLocaleString()}` : 'Not specified'}
- Business Location: ${dealData.businessState || 'Not specified'}
- Reason for Selling: ${dealData.reasonForSelling || 'Not specified'}

${documentInsights ? `
Available Documentation Analysis:
${documentInsights}
` : 'No supporting documents have been uploaded yet.'}

Based on this information, create a compelling 3-4 paragraph deal description that:

1. **Opening Hook**: Start with what makes this business opportunity unique and attractive
2. **Business Overview**: Describe what the business does, its market position, and operational strengths
3. **Financial & Growth Highlights**: Incorporate any financial insights from documents and growth potential
4. **Investment Appeal**: Explain why this is a good investment opportunity and what buyers can expect

Guidelines:
- Use specific details from the provided information and document analysis
- Highlight competitive advantages and market opportunities
- Include operational strengths and asset value
- Mention growth potential and scalability
- Keep tone professional but engaging
- Avoid generic statements - be specific to this business
- If financial data is available in documents, reference performance indicators
- If operational details are available, highlight process efficiency or market position

Generate only the description text, no additional formatting or explanations.`;

    // Call OpenAI to generate description
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are an expert business broker with 20+ years of experience writing compelling deal descriptions that attract qualified buyers. Your descriptions are detailed, factual, and highlight the unique value proposition of each business opportunity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    const generatedDescription = completion.choices[0].message.content;
    console.log('Deal description generated successfully');
    
    return {
      description: generatedDescription,
      documentsAnalyzed: documents.length,
      hasFinancialData: documents.some(d => 
        d.document_versions?.[0]?.text_content?.match(/revenue|income|profit|sales|financial|earnings/i)
      ),
      hasOperationalData: documents.some(d => 
        d.document_versions?.[0]?.text_content?.match(/operations?|process|workflow|staff|employees/i)
      ),
      insights: {
        documentsUsed: documents.map(d => ({ name: d.name, type: d.type })),
        dataQuality: documents.length > 0 ? 'enhanced' : 'basic'
      }
    };
    
  } catch (error) {
    console.error('Error in handleGenerateDealDescription:', error);
    throw new Error('Failed to generate deal description');
  }
}