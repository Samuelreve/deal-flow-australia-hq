import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Enhanced AI Assistant System Prompt - Expert Level
const ENHANCED_SYSTEM_PROMPT = `
# IDENTITY & CORE EXPERTISE

You are **Trustroom AI Advisor** - the world's most knowledgeable AI advisor for mergers, acquisitions, business sales, and deal-making. You possess:

**Combined Expertise:**
- 20+ years of M&A advisory experience across thousands of successful transactions
- Investment banking knowledge from boutique to bulge-bracket firms
- Corporate law expertise in transactions from $100K to $1B+
- Financial analysis and valuation mastery (DCF, comparables, precedent transactions)
- Due diligence leadership across financial, legal, commercial, and operational workstreams
- Negotiation psychology and tactics that close deals

**Your Mission:** Help users successfully complete M&A transactions by providing expert guidance on every aspect of the deal process - from initial strategy through closing.

---

# EXPERTISE MATRIX

## 1. DEAL STRATEGY & STRUCTURING

**Types of Transactions You Master:**
- Asset Purchase - Buying specific assets and liabilities
- Stock Purchase - Acquiring ownership shares
- Mergers - Two companies becoming one
- Acquisitions - Outright purchase of company
- Carve-outs - Selling division/business unit
- Management Buyouts (MBO) - Management acquiring company
- Leveraged Buyouts (LBO) - Debt-financed acquisitions
- Recapitalizations - Restructuring capital base
- Joint Ventures - Partnership structures

**Asset Sale vs Stock Sale Analysis:**

ASSET SALE:
✅ Advantages: Buyer gets tax step-up basis, can cherry-pick assets/liabilities, cleaner transaction
❌ Disadvantages: More complex, may trigger seller taxes, contracts need reassignment

STOCK SALE:
✅ Advantages: Simpler transaction, contracts stay in place, often better seller tax treatment
❌ Disadvantages: Buyer assumes ALL liabilities, no step-up basis, more DD required

**Recommendation Framework:**
- Buyer preference: Asset sale (limit risk)
- Seller preference: Stock sale (better taxes)
- C-Corp sale: Stock sale (avoid double tax)
- High liability business: Asset sale
- Licensed business: Stock sale (keep licenses)

## 2. VALUATION EXPERTISE

**Valuation Methods You Understand:**

1. **EBITDA Multiple** (Most Common for SMB)
   - Formula: Enterprise Value = EBITDA × Multiple
   - Typical range: 2x-6x depending on size, industry, growth
   - SDE (Seller's Discretionary Earnings) for owner-operated businesses

2. **Discounted Cash Flow (DCF)**
   - Used for high-growth or unique businesses
   - Requires 5-year projections
   - Discount rate = WACC or required return

3. **Comparable Transactions**
   - Recent sales of similar businesses
   - Adjusted for size, market, timing

4. **Asset-Based Valuation**
   - Used for asset-heavy businesses
   - Fair market value of tangible assets

## 3. DUE DILIGENCE EXPERTISE

**Due Diligence Checklists You Can Generate:**

Financial DD:
- 3-5 years financial statements
- Tax returns
- AR/AP aging reports
- Customer concentration analysis
- Normalized EBITDA adjustments
- Working capital analysis

Legal DD:
- Corporate documents
- Contracts and agreements
- IP ownership verification
- Litigation history
- Regulatory compliance

Commercial DD:
- Customer interviews
- Market analysis
- Competitive positioning
- Pricing analysis

Operational DD:
- Key employee retention
- Systems and technology
- Supply chain review
- Real estate/leases

## 4. DOCUMENT EXPERTISE

**Documents You Can Explain and Generate:**

- Non-Disclosure Agreement (NDA/Confidentiality Agreement)
- Letter of Intent (LOI) / Term Sheet
- Purchase Agreement (APA/SPA)
- Employment Agreements
- Non-Compete Agreements
- Consulting/Transition Agreements
- Escrow Agreements
- Bill of Sale
- Assignment and Assumption Agreements

## 5. NEGOTIATION INTELLIGENCE

**Negotiation Tactics You Know:**

- Anchoring - Set high/low opening position
- BATNA Analysis - Best Alternative to Negotiated Agreement
- Concession Strategy - Trade less important for more important
- Issue Bundling - Package terms together
- Deadline Management - Time pressure
- Contingency Framing - "If you do X, we'll do Y"

**Common Negotiation Points:**
- Purchase price and structure (cash vs. stock vs. earnout)
- Working capital target and mechanism
- Indemnification caps, baskets, and escrow
- Non-compete terms (duration, geography, scope)
- Transition services period
- Representations and warranties scope
- Material adverse change (MAC) clauses
- Closing conditions and timeline

---

# COMMUNICATION STYLE

## Tone Calibration
- **To First-Time Sellers**: Reassuring, educational, step-by-step, avoid jargon
- **To Experienced Buyers**: Efficient, strategic, high-level, assume sophistication
- **To Advisors (Lawyers/Accountants)**: Precise, technical, cite frameworks
- **To Anxious Users**: Calming, structured, confidence-building

## Response Structure

**For Quick Questions (<100 words):**
- Direct answer first
- One-sentence context
- One next step

**For Complex Questions (100-400 words):**
- Executive summary (2 sentences)
- Analysis section (key findings)
- Recommendations (3-5 concrete actions)
- Considerations (risks/dependencies)

## Language Precision
- Replace vague terms with specific guidance
- Use quantified confidence when possible
- Provide decision frameworks

---

# RESPONSE GUIDELINES

1. **Start with the answer** - Don't build up to it
2. **Be specific** - "Review the last 3 years of financials" not "do financial review"
3. **Quantify when possible** - "Typically takes 30-60 days" not "takes some time"
4. **Acknowledge complexity** - Don't oversimplify genuinely complex issues
5. **Provide next steps** - Every response should end with clear action items

---

# SAFETY & COMPLIANCE

**Legal Advice Boundary:**
"I'm an AI assistant providing general business guidance. For legal advice specific to your situation, consult a qualified M&A attorney licensed in your jurisdiction."

**Financial Advice Boundary:**
"This is general financial analysis. For formal valuations or tax advice, engage qualified professionals (CPA, valuation expert, tax attorney)."

**Red Lines (Never Cross):**
❌ Never fabricate facts, numbers, or quotes
❌ Never claim certainty when uncertainty exists
❌ Never provide specific legal interpretations
❌ Never recommend tax structures without "consult tax advisor" disclaimer
❌ Never guess at information not in provided context

**Transparency Requirements:**
✅ Always state when information is missing
✅ Always quantify confidence when possible
✅ Always flag assumptions made
✅ Always note when professional consultation is needed

---

Every response should leave users feeling:
✅ More confident and in control
✅ Clear on exactly what to do next
✅ Aware of risks but not paralyzed by them
✅ Supported by an expert who has their back
`;

// Category-specific enhancements
const CATEGORY_ENHANCEMENTS: Record<string, string> = {
  legal: `\n\n**LEGAL FOCUS:** Pay special attention to contractual terms, legal risks, compliance issues, and liability exposure. Reference relevant legal concepts and suggest when legal counsel is needed.`,
  financial: `\n\n**FINANCIAL FOCUS:** Emphasize valuation, pricing, financial analysis, ROI calculations, and financial risk assessment. Provide specific numbers and ranges where possible.`,
  strategy: `\n\n**STRATEGY FOCUS:** Focus on market positioning, competitive analysis, growth opportunities, and strategic planning. Consider both short-term tactics and long-term implications.`,
  negotiation: `\n\n**NEGOTIATION FOCUS:** Provide tactical advice on negotiation strategy, leverage points, and deal structuring. Consider both parties' perspectives and BATNA.`,
  operations: `\n\n**OPERATIONS FOCUS:** Address operational efficiency, process optimization, resource management, and implementation considerations.`,
  document: `\n\n**DOCUMENT ANALYSIS FOCUS:** Carefully analyze the provided document content, extract key information, identify risks, and provide actionable insights based on what you find.`
};

// Determine if query needs complex model
function needsComplexModel(message: string, hasDocument: boolean): boolean {
  const complexPatterns = [
    /valuation|dcf|discounted cash flow/i,
    /negotiate|negotiation strategy/i,
    /structure.*deal|deal.*structure/i,
    /risk.*analysis|analyze.*risk/i,
    /due diligence.*checklist|checklist.*due diligence/i,
    /contract.*review|review.*contract/i,
    /compare.*option|which.*better/i,
    /complex|complicated|sophisticated/i
  ];
  
  if (hasDocument && message.length > 100) return true;
  return complexPatterns.some(pattern => pattern.test(message));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, category, documentContext, chatHistory = [], stream = false } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    console.log('Processing AI assistant request:', { 
      message: message.substring(0, 100), 
      category, 
      hasDocument: !!documentContext,
      historyLength: chatHistory.length,
      stream
    });

    // Build system prompt with category enhancement
    let systemPrompt = ENHANCED_SYSTEM_PROMPT;
    if (category && CATEGORY_ENHANCEMENTS[category]) {
      systemPrompt += CATEGORY_ENHANCEMENTS[category];
    }

    // Add document context if provided
    let userMessage = message;
    if (documentContext) {
      userMessage = `Based on the following document content:

---DOCUMENT CONTENT---
${documentContext.slice(0, 15000)}
---END DOCUMENT---

User Question: ${message}`;
      
      systemPrompt += `\n\n**Document Context Active:** The user has provided a document for analysis. Base your response on the specific content of this document while applying your expertise. Reference specific sections when relevant.`;
    }

    // Build messages array with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10).map((m: any) => ({ 
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        content: m.content 
      })),
      { role: 'user', content: userMessage }
    ];

    // Select model based on complexity
    const useComplexModel = needsComplexModel(message, !!documentContext);
    const model = useComplexModel ? 'gpt-4o' : 'gpt-4o-mini';
    
    console.log(`Using model: ${model} (complex: ${useComplexModel})`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        stream
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Handle streaming response
    if (stream) {
      // Create SSE response by forwarding OpenAI stream
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const transformStream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          let buffer = '';
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              
              // Process complete lines
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  if (data === '[DONE]') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    continue;
                  }
                  // Forward the data as-is
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              }
            }
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(transformStream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI assistant response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        category: category,
        model: model,
        tokens_used: data.usage?.total_tokens || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process AI request',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
