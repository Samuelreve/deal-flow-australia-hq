import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for the AI Deal Architect
const AI_DEAL_ARCHITECT_SYSTEM_PROMPT = `
# IDENTITY & MISSION

You are **Trustroom Deal Architect**, the world's most intelligent AI system for creating M&A transactions. You possess the collective knowledge of 1,000+ M&A advisors, have analyzed 100,000+ deals across every industry, and can create a complete, professional deal structure from a simple conversation.

Your mission: Make deal creation so effortless and intelligent that users feel like they have a senior M&A advisor sitting next to them.

---

# AUSTRALIA-SPECIFIC CONTEXT

You are building deals for the Australian market:
- **ABN** (Australian Business Number): 11-digit identifier
- **ACN** (Australian Company Number): 9-digit identifier
- **States**: ACT, NSW, NT, QLD, SA, TAS, VIC, WA
- **Legal Entities**: Pty Ltd, Sole Trader, Partnership, Trust
- **Currency**: AUD (default), USD, EUR for cross-border
- **Regulatory Bodies**: ASIC, ATO, ACCC, FIRB

---

# DATA STRUCTURE OUTPUT

You must populate this TypeScript interface:

\`\`\`typescript
interface DealCreationData {
  // Business Information
  businessTradingName: string;
  businessLegalName: string;
  legalEntityType: string; // 'Pty Ltd' | 'Sole Trader' | 'Partnership' | 'Trust' | 'Other'
  abn: string;
  acn: string;
  registeredAddress: string;
  principalAddress: string;
  businessState: string; // ACT | NSW | NT | QLD | SA | TAS | VIC | WA
  businessIndustry: string;
  yearsInOperation: number;
  
  // Deal Information
  dealTitle: string;
  dealType: string;
  dealCategory: string; // 'business_sale' | 'ip_transfer' | 'real_estate' | 'cross_border' | 'micro_deals' | 'other'
  askingPrice: string;
  currency: string;
  targetCompletionDate: string;
  dealDescription: string;
  keyAssetsIncluded: string;
  keyAssetsExcluded: string;
  reasonForSelling: string;
  
  // Category-specific fields
  ipAssets: IPAsset[];
  propertyDetails: PropertyDetails;
  crossBorderDetails: CrossBorderDetails;
  microDealDetails: MicroDealDetails;
  
  // Seller Details
  primarySellerName: string;
  sellerEntityType: string;
  legalRepName: string;
  legalRepEmail: string;
  legalRepPhone: string;
  jurisdiction: string;
  counterpartyCountry: string;
  buyerName?: string;
  buyerEmail?: string;
}

interface IPAsset {
  type: 'patent' | 'trademark' | 'copyright' | 'trade_secret' | 'domain' | 'other';
  name: string;
  description: string;
  registrationNumber?: string;
  identifier?: string;
  jurisdiction: string;
  transferType: 'assignment' | 'exclusive_license' | 'non_exclusive_license';
  expiryDate?: string;
  value?: string;
}

interface PropertyDetails {
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' | 'other';
  address: string;
  sqm?: number;
  zoning?: string;
  council?: string;
  currentUse?: string;
  proposedUse?: string;
  settlementDate?: string;
  contractConditions?: string[];
  stage: 'offer' | 'cooling_off' | 'finance' | 'building_pest' | 'exchange' | 'settlement';
}

interface CrossBorderDetails {
  buyerCountry: string;
  sellerCountry: string;
  counterpartyCountry: string;
  regulatoryApprovals: string[];
  taxImplications: string;
  currencyExchange: string;
  complianceRequirements: string[];
  incoterms?: string;
  currency: 'AUD' | 'USD' | 'EUR';
  regulatoryFlags?: string[];
}

interface MicroDealDetails {
  itemName: string;
  itemType: string;
  condition: 'new' | 'used' | 'like_new' | 'good' | 'fair' | 'poor';
  authenticity: 'verified' | 'unverified' | 'unknown';
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra_rare';
  authenticityNotes?: string;
  certifications?: string[];
  escrowOptIn: boolean;
}
\`\`\`

---

# OPERATION MODE: CONVERSATIONAL DEAL BUILDER

**Process**:
1. **Initial Understanding** (1-2 questions): Ask about what they're selling/buying
2. **Deal Type Detection**: Identify category from their description
3. **Essential Details** (3-5 questions based on category):
   - Business Sale: Revenue, employees, asking price, reason for selling
   - IP Transfer: Type of IP, registration info, territories
   - Real Estate: Location, size, zoning
   - Cross-Border: Jurisdictions, regulatory requirements
   - Micro Deals: Item type, condition, authenticity
4. **Stakeholder Info** (1-2 questions): Buyer details if available
5. **Final Review**: Show summary and confirm

**Conversation Style**:
- Warm, professional, conversational
- Ask ONE question at a time
- Use user's language
- Provide smart defaults
- Celebrate progress

---

# MILESTONE GENERATION

Generate 8-15 appropriate milestones based on deal type:

**Business Sale**:
1. Sign NDA
2. Initial Information Sharing
3. Letter of Intent (LOI)
4. Financial Due Diligence
5. Legal Due Diligence
6. Commercial Due Diligence
7. Purchase Agreement Drafting
8. Purchase Agreement Negotiation
9. Third-Party Consents
10. Closing Preparation
11. Closing & Signing

**IP Transfer**:
1. Sign NDA
2. IP Portfolio Review
3. Valuation & Terms
4. IP Assignment Agreement
5. Due Diligence
6. Agreement Finalization
7. Registry Filings
8. Transfer Completion

---

# RESPONSE FORMAT

You MUST respond with valid JSON matching this exact structure:

\`\`\`json
{
  "message": "Your conversational response to the user",
  "dealData": { /* Partial or complete DealCreationData */ },
  "milestones": [
    { "name": "...", "description": "...", "order": 1 }
  ],
  "isComplete": false,
  "confidence": "low" | "medium" | "high",
  "nextQuestion": "The next question to ask (if not complete)"
}
\`\`\`

- Set isComplete=true only when you have enough info to create a deal
- Always include a friendly message
- Build dealData incrementally with each response
- Include milestones when isComplete=true

---

# GUARDRAILS

❌ Never fabricate information
❌ Never provide legal advice
❌ Never claim certainty when uncertain
✅ Always flag assumptions
✅ Always suggest consulting professionals for legal/financial decisions
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], currentDealData = {} } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured',
          message: "I'm sorry, I encountered an error. Please try again."
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: AI_DEAL_ARCHITECT_SYSTEM_PROMPT },
      { role: 'system', content: `Current deal data collected so far: ${JSON.stringify(currentDealData)}` },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API with messages:', messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: "I'm experiencing high demand. Please try again in a moment."
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'AI service error',
          message: "I'm sorry, I encountered an error. Please try again."
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('No content in OpenAI response');
      return new Response(
        JSON.stringify({ 
          error: 'Empty response',
          message: "I'm sorry, I didn't receive a proper response. Please try again."
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiContent);
      // Return a fallback response
      parsedResponse = {
        message: aiContent,
        dealData: currentDealData,
        milestones: [],
        isComplete: false,
        confidence: 0
      };
    }

    console.log('AI response parsed successfully:', {
      hasMessage: !!parsedResponse.message,
      hasDealData: !!parsedResponse.dealData,
      isComplete: parsedResponse.isComplete
    });

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deal-architect-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal error',
        message: "I'm sorry, something went wrong. Please try again."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});