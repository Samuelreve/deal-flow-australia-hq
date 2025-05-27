
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { message, category, documentContext } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    console.log('Processing AI business request:', { message: message.substring(0, 100), category, hasDocument: !!documentContext });

    // Build context-aware system prompt based on category
    let systemPrompt = `You are a highly experienced business advisor and AI assistant for DealPilot, specializing in business transactions, deal management, and strategic guidance. You provide expert-level advice that founders, executives, and business professionals rely on for critical decisions.

Core Expertise Areas:
- Business analysis and strategic planning
- Deal structuring and negotiations
- Contract review and legal guidance (informational only)
- Financial analysis and projections
- Risk assessment and mitigation strategies
- M&A transactions and due diligence
- Business valuation and pricing strategies
- Operational efficiency and process optimization

Communication Style:
- Professional yet conversational
- Provide actionable, specific advice
- Use bullet points and clear structure for complex topics
- Include relevant examples when helpful
- Always remind users to consult qualified professionals for legal/financial advice

Response Format:
- Keep responses concise but comprehensive (2-4 paragraphs typical)
- Use headers for different sections when appropriate
- Provide clear next steps or recommendations
- Highlight key risks or opportunities`;

    // Enhance system prompt based on detected category
    if (category) {
      switch (category) {
        case 'legal':
          systemPrompt += `\n\nFocus: Legal Analysis
- Analyze contract clauses and legal implications
- Identify potential risks and liabilities
- Suggest protective measures and negotiation points
- Explain legal concepts in business terms
- Always emphasize the need for professional legal review`;
          break;
        case 'financial':
          systemPrompt += `\n\nFocus: Financial Analysis
- Break down financial terms and implications
- Analyze pricing strategies and valuation methods
- Assess financial risks and opportunities
- Provide frameworks for financial decision-making
- Consider cash flow and investment implications`;
          break;
        case 'strategy':
          systemPrompt += `\n\nFocus: Business Strategy
- Analyze market opportunities and competitive positioning
- Develop strategic frameworks and planning approaches
- Assess growth strategies and expansion options
- Consider operational and resource implications
- Provide actionable strategic recommendations`;
          break;
        case 'negotiation':
          systemPrompt += `\n\nFocus: Deal Negotiation
- Analyze negotiation positions and leverage points
- Suggest tactics and approaches for better outcomes
- Identify win-win opportunities
- Consider relationship management aspects
- Provide frameworks for structured negotiations`;
          break;
        case 'operations':
          systemPrompt += `\n\nFocus: Operational Excellence
- Analyze process efficiency and optimization opportunities
- Suggest operational improvements and best practices
- Consider resource allocation and team management
- Provide frameworks for operational decision-making
- Focus on scalability and sustainable growth`;
          break;
        case 'document':
          systemPrompt += `\n\nFocus: Document Analysis
- Extract key information and terms from documents
- Summarize complex content in business terms
- Identify important clauses and provisions
- Highlight potential issues or opportunities
- Provide clear, actionable insights from document content`;
          break;
      }
    }

    // Add document context if provided
    let userMessage = message;
    if (documentContext) {
      userMessage = `Based on the following document content:

---DOCUMENT CONTENT---
${documentContext}
---END DOCUMENT---

Question: ${message}`;
      
      systemPrompt += `\n\nDocument Context: The user has provided a document for analysis. Base your response on the specific content of this document while applying your business expertise.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI business response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        category: category,
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
