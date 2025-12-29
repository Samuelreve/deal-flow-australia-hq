import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { DOCUMENT_SUGGESTION_PROMPT } from "../_shared/ai-prompts.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface SuggestionRequest {
  documentText: string;
  extractedData: any;
  fieldType: 'title' | 'description' | 'valuation' | 'assets';
  currentValue: string;
  dealCategory: string;
}

const generateSuggestion = async (request: SuggestionRequest): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const { documentText, extractedData, fieldType, currentValue, dealCategory } = request;

  const fieldPrompts = {
    title: `Based on the document, suggest a professional deal title.

Document Category: ${dealCategory}
Current Title: ${currentValue || 'None'}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}

Requirements:
- Keep under 60 characters
- Use title case
- Be specific to the transaction type
- Format examples:
  * Business Sale: "[Company Name] Acquisition"
  * Real Estate: "Property Sale - [Address]"
  * IP Transfer: "IP Transfer - [Asset Name]"

Respond with just the suggested title.`,

    description: `Based on the document, create a compelling deal description.

Document Category: ${dealCategory}
Current Description: ${currentValue || 'None'}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
Document Excerpt: ${documentText.substring(0, 2000)}...

Requirements:
- 2-3 sentences covering: What's being sold, key business details, what's included
- Maximum 300 words
- Buyer-focused, professional tone
- Include specific metrics if found (revenue, customers, assets)

Respond with the suggested description.`,

    valuation: `Based on the document, provide valuation guidance.

Document Category: ${dealCategory}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
Document Excerpt: ${documentText.substring(0, 2000)}...

Look for:
- Explicit asking price or purchase price
- EBITDA with implied multiple
- Asset values
- Revenue figures

If explicit price found, state it.
If calculating from multiples, explain briefly.
If insufficient data, say so.

Format: "Based on [source], the suggested valuation is $[amount]" or "Insufficient data to suggest valuation - [what's missing]"`,

    assets: `Based on the document, identify key assets included in the transaction.

Document Category: ${dealCategory}
Current Assets: ${currentValue || 'None'}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
Document Excerpt: ${documentText.substring(0, 2000)}...

Categories to identify:
- Tangible: Equipment, inventory, vehicles, real estate
- Intangible: IP, customer lists, brand, software, licenses
- Contractual: Leases, customer contracts, supplier agreements

Format: "[Category]: [specific items], [Category]: [specific items]"
Keep concise - focus on material assets mentioned in the document.`
  };

  const prompt = fieldPrompts[fieldType];

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
            content: DOCUMENT_SUGGESTION_PROMPT
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

    const suggestion = await generateSuggestion(request);

    return new Response(JSON.stringify({ 
      success: true,
      suggestion
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
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
