import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface SuggestionRequest {
  documentText: string;
  extractedData: any;
  businessContext?: {
    businessTradingName?: string;
    businessLegalName?: string;
    businessIndustry?: string;
    yearsInOperation?: number;
    primarySellerName?: string;
  };
  fieldType: 'title' | 'description' | 'valuation' | 'assets';
  currentValue: string;
  dealCategory: string;
}

const generateSuggestion = async (request: SuggestionRequest): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const { documentText, extractedData, businessContext, fieldType, currentValue, dealCategory } = request;

  // Build context for AI
  let context = `Document content: ${documentText}\n`;
  if (extractedData && Object.keys(extractedData).length > 0) {
    context += `\nExtracted data: ${JSON.stringify(extractedData, null, 2)}\n`;
  }
  if (businessContext && Object.keys(businessContext).length > 0) {
    context += `\nBusiness context: ${JSON.stringify(businessContext, null, 2)}\n`;
  }

  const prompts = {
    title: `Based on the following information, suggest a professional deal title:

Document Category: ${dealCategory}
Current Title: ${currentValue}
${context}

Generate a concise, professional deal title that accurately represents this transaction. Examples:
- Business Sale: "Sale of [Business Name] - [Deal Type]"
- Real Estate: "Property Sale - [Address]"
- IP Transfer: "IP Transfer - [Asset Name]"
- Cross-Border: "Cross-Border Transaction - [Description]"
- Micro Deal: "Sale of [Item Name]"

Respond with just the suggested title, no explanation.`,

    description: `Based on the following information, enhance the deal description:

Document Category: ${dealCategory}
Current Description: ${currentValue}
${context}

Generate a compelling, professional deal description that includes:
- What is being sold/transferred
- Key value propositions and strengths
- Important business/property/asset details
- Growth opportunities or strategic value
- Any unique selling points from the available information

Keep it professional and buyer-focused. Maximum 300 words.`,

    valuation: `Based on the following document and extracted business information, provide a valuation insight:

Document Category: ${dealCategory}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
Document Text Excerpt: ${documentText.substring(0, 1000)}...

Analyze the business/asset information and provide a valuation tip in this format:
"Based on [type] with [key metric], typical asking prices range from [range]. Consider [specific advice]."

Focus on:
- Industry multiples if business data is available
- Comparable sales data
- Key value drivers mentioned in the document
- Professional valuation recommendations

Respond with just the valuation tip, starting with "Based on".`,

    assets: `Based on the following document and extracted data, suggest key assets and exclusions:

Document Category: ${dealCategory}
Current Assets: ${currentValue}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
Document Text Excerpt: ${documentText.substring(0, 1000)}...

Analyze the document and suggest:
1. Key assets that should be included in the sale
2. Items that might be excluded

Look for mentions of:
- Equipment, machinery, inventory
- Intellectual property, customer lists
- Real estate, lease agreements
- Goodwill, brand value
- Contracts and licenses

Format as: "Key assets: [list]. Typical exclusions: [list]."
Keep it concise and relevant to the specific deal.`
  };

  const prompt = prompts[fieldType];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a business deal advisor helping create professional deal documentation. Provide practical, actionable suggestions based on document analysis.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI suggestion generation failed:', error);
    throw error;
  }
};

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: SuggestionRequest = await req.json();

    console.log(`🤖 Generating ${request.fieldType} suggestion for ${request.dealCategory} deal`);

    const suggestion = await generateSuggestion(request);

    console.log(`✅ AI suggestion generated successfully`);

    return new Response(JSON.stringify({ 
      success: true,
      suggestion
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ AI suggestion error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `AI suggestion failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);