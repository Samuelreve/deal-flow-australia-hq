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
    const prompt = `You are a seasoned M&A advisor and business broker with 20+ years of experience crafting compelling acquisition narratives. Your expertise spans multiple industries, and you understand what sophisticated buyers look for in investment opportunities.

BUSINESS PROFILE:
- Company: ${dealData.businessTradingName || dealData.businessLegalName || 'Established Business'}
- Legal Entity: ${dealData.businessLegalName || 'To be disclosed'}
- Industry Sector: ${dealData.businessIndustry || 'Diversified Operations'}
- Operating History: ${dealData.yearsInOperation ? `${dealData.yearsInOperation} years of proven performance` : 'Established track record'}
- Transaction Type: ${dealData.dealType || 'Strategic Acquisition'}
- Investment Size: ${dealData.askingPrice ? `$${Number(dealData.askingPrice).toLocaleString()}` : 'Price upon inquiry'}
- Geographic Market: ${dealData.businessState || 'Prime location'}
- Divestiture Rationale: ${dealData.reasonForSelling || 'Strategic repositioning'}

${documentInsights ? `
PROPRIETARY DUE DILIGENCE INSIGHTS:
${documentInsights}

KEY FINANCIAL & OPERATIONAL INTELLIGENCE:
Based on our analysis of the provided documentation, we have identified several value drivers and operational metrics that enhance the investment thesis.
` : `
PRELIMINARY ASSESSMENT:
While comprehensive financial documentation is pending upload, initial business parameters suggest a compelling opportunity for the right strategic or financial buyer.
`}

ASSIGNMENT: Craft an institutional-quality investment memorandum summary that positions this opportunity for serious acquirers. Structure as follows:

1. **EXECUTIVE SUMMARY & VALUE PROPOSITION** (Opening paragraph)
   - Lead with the most compelling investment hook
   - Quantify the opportunity size and market position where possible
   - Highlight unique competitive moats or market advantages
   - Position as either growth, cash flow, or strategic value play

2. **BUSINESS MODEL & MARKET DYNAMICS** (Core business paragraph)
   - Articulate the business model and revenue streams
   - Address market positioning and competitive landscape
   - Identify key operational strengths and scalability factors
   - Reference industry trends that support the investment thesis

3. **FINANCIAL PERFORMANCE & GROWTH CATALYSTS** (Performance paragraph)
   - Synthesize any financial data from documentation into performance narrative
   - Highlight historical growth patterns, profitability metrics, or cash generation
   - Identify untapped growth vectors and expansion opportunities
   - Address working capital efficiency and operational leverage

4. **STRATEGIC RATIONALE & BUYER APPEAL** (Investment conclusion)
   - Define the ideal buyer profile (strategic vs. financial)
   - Articulate synergy potential and value creation opportunities
   - Address scalability and platform potential
   - Create urgency around market timing and competitive dynamics

WRITING STANDARDS:
- Employ sophisticated financial and strategic terminology
- Quantify claims wherever possible using document data
- Avoid generic business language - make every sentence specific to this opportunity
- Balance confidence with appropriate professional disclaimers
- Create compelling narrative flow that builds investment conviction
- Target audience: sophisticated buyers, private equity, strategic acquirers

Generate a polished, professional description that reads like it came from a top-tier investment bank. Focus on value creation, strategic fit, and investment returns.

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