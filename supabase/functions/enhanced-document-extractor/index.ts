import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import PDF.js for direct text extraction
import { getDocument } from "https://esm.sh/pdf.mjs";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ExtractionRequest {
  fileBase64: string;
  mimeType: string;
  fileName: string;
  dealCategory?: 'business_sale' | 'ip_transfer' | 'real_estate' | 'cross_border' | 'micro_deals' | 'other';
}

interface ExtractionResult {
  success: boolean;
  text?: string;
  extractedData?: CategorySpecificData;
  error?: string;
}

interface CategorySpecificData {
  dealCategory?: string;
  businessInfo?: {
    businessName?: string;
    legalName?: string;
    abn?: string;
    acn?: string;
    industry?: string;
    yearsInOperation?: number;
    address?: string;
  };
  financialInfo?: {
    askingPrice?: string;
    revenue?: string;
    profit?: string;
    assets?: string;
    liabilities?: string;
  };
  ipAssets?: Array<{
    type: string;
    name: string;
    registrationNumber?: string;
    expiryDate?: string;
  }>;
  propertyDetails?: {
    propertyType?: string;
    address?: string;
    sqm?: number;
    zoning?: string;
    council?: string;
  };
  crossBorderInfo?: {
    buyerCountry?: string;
    sellerCountry?: string;
    regulatoryRequirements?: string[];
  };
  microDealInfo?: {
    itemType?: string;
    condition?: string;
    rarity?: string;
    authenticity?: string;
  };
}

const extractTextFromPDF = async (fileBase64: string): Promise<string> => {
  // Clean up base64 format
  let cleanBase64 = fileBase64;
  if (fileBase64.includes(',')) {
    cleanBase64 = fileBase64.split(',')[1];
  }

  // Convert base64 to Uint8Array
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Validate PDF
  const pdfHeader = new TextDecoder().decode(bytes.slice(0, 4));
  if (pdfHeader !== '%PDF') {
    throw new Error('File is not a valid PDF');
  }

  // Extract text using PDF.js
  const pdfDoc = await getDocument({ data: bytes }).promise;
  let allText = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    
    if (pageText) {
      allText += pageText + '\n\n';
    }
  }

  return allText.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};

const extractCategorySpecificData = async (text: string, category: string): Promise<CategorySpecificData> => {
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key available - returning basic extraction');
    return { dealCategory: category };
  }

  const prompts = {
    business_sale: `Extract business sale information from this document:
- Business name and legal name
- ABN/ACN if mentioned
- Industry/sector
- Years in operation
- Financial information (revenue, profit, asking price)
- Key assets
- Address/location

Text: ${text}

Respond with JSON only.`,

    ip_transfer: `Extract intellectual property information from this document:
- IP assets (patents, trademarks, copyrights, domains)
- Registration numbers and expiry dates
- Asset names and descriptions
- Transfer conditions
- Financial terms

Text: ${text}

Respond with JSON only.`,

    real_estate: `Extract property information from this document:
- Property type (residential/commercial/industrial)
- Address and location details
- Square meters/area
- Zoning information
- Council/local authority
- Current and proposed use
- Financial terms
- Settlement details

Text: ${text}

Respond with JSON only.`,

    cross_border: `Extract cross-border transaction information:
- Buyer and seller countries
- Regulatory requirements
- Compliance obligations
- Tax implications
- Currency exchange details
- International law considerations

Text: ${text}

Respond with JSON only.`,

    micro_deals: `Extract collectible/item information from this document:
- Item type and description
- Condition assessment
- Rarity level
- Authenticity verification
- Provenance/history
- Certifications
- Market value

Text: ${text}

Respond with JSON only.`
  };

  const prompt = prompts[category as keyof typeof prompts] || prompts.business_sale;

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
            content: 'You are a document extraction expert. Extract structured data from legal and business documents. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    try {
      return JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', extractedText);
      return { dealCategory: category };
    }
  } catch (error) {
    console.error('AI extraction failed:', error);
    return { dealCategory: category };
  }
};

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, mimeType, fileName, dealCategory = 'business_sale' }: ExtractionRequest = await req.json();

    if (!fileBase64) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No file data provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 Starting enhanced extraction for: ${fileName} (Category: ${dealCategory})`);

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(fileBase64);
    
    if (!extractedText.trim()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No readable text found in the document'
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract category-specific data using AI
    const extractedData = await extractCategorySpecificData(extractedText, dealCategory);

    console.log(`✅ Enhanced extraction completed for ${fileName}`);

    return new Response(JSON.stringify({ 
      success: true, 
      text: extractedText,
      extractedData: extractedData,
      category: dealCategory
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Enhanced document extractor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Enhanced extraction failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);