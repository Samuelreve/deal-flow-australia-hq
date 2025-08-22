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
    assetsIncluded?: string;
    liabilitiesIncluded?: string;
  };
  financialInfo?: {
    askingPrice?: string;
    revenue?: string;
    profit?: string;
    assets?: string;
    liabilities?: string;
  };
  sellerInfo?: {
    primarySellerName?: string;
    sellerEntityType?: string;
    legalRepName?: string;
    legalRepEmail?: string;
    legalRepPhone?: string;
    jurisdiction?: string;
    counterpartyCountry?: string;
    buyerName?: string;
    buyerEmail?: string;
  };
  ipAssets?: Array<{
    type: string;
    name: string;
    registrationNumber?: string;
    expiryDate?: string;
    jurisdiction?: string;
    transferType?: string;
  }>;
  propertyDetails?: {
    propertyType?: string;
    address?: string;
    sqm?: number;
    zoning?: string;
    council?: string;
    stage?: string;
    settlementDate?: string;
  };
  crossBorderInfo?: {
    buyerCountry?: string;
    sellerCountry?: string;
    counterpartyCountry?: string;
    regulatoryRequirements?: string[];
    incoterms?: string;
    currency?: string;
    regulatoryFlags?: string[];
  };
  microDealInfo?: {
    itemName?: string;
    itemType?: string;
    condition?: string;
    rarity?: string;
    authenticity?: string;
    authenticityNotes?: string;
    escrowOptIn?: boolean;
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

const detectDealCategory = (text: string): string => {
  const categories = {
    ip_transfer: ['assignment of ip', 'license', 'trademark no.', 'tm', 'patent app', 'ipo', 'intellectual property', 'copyright', 'trade secret', 'patent', 'trademark', 'ip rights'],
    real_estate: ['conveyancing', 'settlement', 'exchange', 'property', 'real estate', 'title deed', 'council rates', 'zoning', 'strata'],
    cross_border: ['cross-border', 'overseas', 'incoterms', 'fob', 'cif', 'exw', 'international', 'export', 'import', 'customs'],
    micro_deals: ['pokémon', 'trading card', 'psa grade', 'collectible', 'mint condition', 'graded', 'authentication', 'rare card']
  };

  const lowerText = text.toLowerCase();
  let categoryScores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(categories)) {
    categoryScores[category] = 0;
    for (const keyword of keywords) {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      categoryScores[category] += matches;
    }
  }

  // Find category with highest score
  const detectedCategory = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)[0];

  return detectedCategory[1] > 0 ? detectedCategory[0] : 'business_sale';
};

const extractCategorySpecificData = async (text: string, category: string): Promise<CategorySpecificData> => {
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key available - returning basic extraction');
    return { dealCategory: category };
  }

  const prompts = {
    business_sale: `Extract business sale information from this document. Look for these specific keywords and details:
- Business names, legal entities, ABN/ACN numbers
- Industry/sector information
- Years in operation
- Financial information (revenue, profit, asking price)
- Assets included and liabilities included
- Address/location details
- Seller contact information and legal representatives
- Entity types and jurisdictions

Return JSON with structure: {
  "businessInfo": { "businessName": "", "legalName": "", "abn": "", "acn": "", "industry": "", "yearsInOperation": 0, "address": "", "assetsIncluded": "", "liabilitiesIncluded": "" },
  "financialInfo": { "askingPrice": "" },
  "sellerInfo": { "primarySellerName": "", "sellerEntityType": "", "legalRepName": "", "legalRepEmail": "", "legalRepPhone": "", "jurisdiction": "", "buyerName": "", "buyerEmail": "" }
}

Text: ${text}`,

    ip_transfer: `Extract intellectual property information from this document. SPECIFICALLY look for these keywords and phrases:
- KEYWORDS: "assignment of IP", "license", "trademark no.", "TM", "patent app", "IPO", "intellectual property", "copyright", "trade secret"
- IP assets (patents, trademarks, copyrights, trade secrets)
- Registration numbers (look for "TM", "®", patent numbers, application numbers)
- Asset names and descriptions
- Transfer type indicators: "assignment", "exclusive license", "non-exclusive license"
- Jurisdiction information (country/state where IP is registered)
- Expiry dates and renewal dates
- Seller and legal representative details

When you find these keywords, extract the surrounding context for detailed information.

Return JSON with structure: {
  "ipAssets": [{ "type": "patent|trademark|copyright|trade_secret", "name": "", "registrationNumber": "", "expiryDate": "", "jurisdiction": "", "transferType": "assignment|exclusive_license|nonexclusive_license" }],
  "financialInfo": { "askingPrice": "" },
  "sellerInfo": { "primarySellerName": "", "sellerEntityType": "", "legalRepName": "", "legalRepEmail": "", "legalRepPhone": "", "jurisdiction": "", "buyerName": "", "buyerEmail": "" }
}

Text: ${text}`,

    real_estate: `Extract property information from this document. SPECIFICALLY look for these keywords and phrases:
- KEYWORDS: "conveyancing", "settlement", "exchange", "property", "real estate", "title", "deed"
- Address information (full street addresses, suburbs, postcodes)
- Property type indicators (residential, commercial, industrial)
- Area measurements (square meters, hectares, acres)
- Zoning information and council details
- Settlement process keywords: "settlement date", "exchange date", "cooling off"
- Contract stages: "offer", "exchange", "settlement"
- Legal and conveyancing representative details

When you find address lines or property keywords, extract complete address details.

Return JSON with structure: {
  "propertyDetails": { "propertyType": "residential|commercial|industrial", "address": "", "sqm": 0, "zoning": "", "council": "", "stage": "offer|cooling_off|finance|building_pest|exchange|settlement", "settlementDate": "" },
  "financialInfo": { "askingPrice": "" },
  "sellerInfo": { "primarySellerName": "", "sellerEntityType": "", "legalRepName": "", "legalRepEmail": "", "legalRepPhone": "", "jurisdiction": "", "buyerName": "", "buyerEmail": "" }
}

Text: ${text}`,

    cross_border: `Extract cross-border transaction information from this document. SPECIFICALLY look for these keywords and phrases:
- KEYWORDS: "cross-border", "overseas", "international", "Incoterms", "FOB", "CIF", "EXW", "DDP", "FCA"
- Country names and jurisdictions (buyer country, seller country)
- Currency information (AUD, USD, EUR, GBP, etc.)
- Regulatory keywords: "compliance", "regulatory approval", "export", "import"
- Tax implications and international law references
- Customs and duty information
- International shipping and logistics terms
- Cross-border legal representative details

When you find these keywords, pay special attention to country names and regulatory requirements.

Return JSON with structure: {
  "crossBorderInfo": { "buyerCountry": "", "sellerCountry": "", "counterpartyCountry": "", "regulatoryRequirements": [], "incoterms": "", "currency": "AUD|USD|EUR", "regulatoryFlags": [] },
  "financialInfo": { "askingPrice": "" },
  "sellerInfo": { "primarySellerName": "", "sellerEntityType": "", "legalRepName": "", "legalRepEmail": "", "legalRepPhone": "", "jurisdiction": "", "counterpartyCountry": "", "buyerName": "", "buyerEmail": "" }
}

Text: ${text}`,

    micro_deals: `Extract collectible/item information from this document. SPECIFICALLY look for these keywords and phrases:
- KEYWORDS: "Pokémon", "trading card", "PSA grade", "collectible", "mint condition", "graded", "authentication"
- Item identification: card names, sets, years, series
- Condition keywords: "mint", "near mint", "excellent", "good", "poor", "damaged"
- Grading information: "PSA", "BGS", "CGC", grades (1-10)
- Authenticity indicators: "authentic", "verified", "certified", "holographic"
- Rarity indicators: "rare", "ultra rare", "common", "uncommon", "limited edition"
- Provenance and certification details
- Escrow and payment security mentions

When you find collectible keywords, extract detailed condition and authenticity information.

Return JSON with structure: {
  "microDealInfo": { "itemName": "", "itemType": "", "condition": "new|mint|near_mint|excellent|good|fair|poor", "rarity": "common|uncommon|rare|ultra_rare|legendary", "authenticity": "verified|unverified|unknown", "authenticityNotes": "", "escrowOptIn": false },
  "financialInfo": { "askingPrice": "" },
  "sellerInfo": { "primarySellerName": "", "sellerEntityType": "", "legalRepName": "", "legalRepEmail": "", "legalRepPhone": "", "jurisdiction": "", "buyerName": "", "buyerEmail": "" }
}

Text: ${text}`
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
      // Clean the response text - remove markdown code blocks if present
      let cleanedText = extractedText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', extractedText);
      console.error('Parse error:', parseError);
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

    // Auto-detect deal category if not specified or if specified as business_sale
    let finalCategory = dealCategory;
    if (dealCategory === 'business_sale' || !dealCategory) {
      const detectedCategory = detectDealCategory(extractedText);
      if (detectedCategory !== 'business_sale') {
        finalCategory = detectedCategory;
        console.log(`🎯 Auto-detected category: ${detectedCategory} based on keywords`);
      }
    }

    // Extract category-specific data using AI
    const extractedData = await extractCategorySpecificData(extractedText, finalCategory);

    console.log(`✅ Enhanced extraction completed for ${fileName}`);

    return new Response(JSON.stringify({ 
      success: true, 
      text: extractedText,
      extractedData: extractedData,
      category: finalCategory,
      detectedCategory: finalCategory !== dealCategory ? finalCategory : undefined
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