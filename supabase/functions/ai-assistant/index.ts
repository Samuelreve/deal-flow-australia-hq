
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
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

    // Build conversational system prompt based on category
    let systemPrompt = `You are a professional AI assistant answering inside a chat interface.

Keep your tone formal but conversational — like a smart advisor giving real help in a calm, human voice. Keep formatting clean and structured (with short headings and bullet points when useful), but avoid sounding like a report or article.

Rules:
- No markdown headers (e.g., avoid ### or bold everywhere)
- Use plain paragraph spacing with light bullets if needed
- Begin with a simple summary sentence in plain English
- Avoid robotic phrases like "Here's a breakdown" or "Ultimately…"
- Speak directly and helpfully, as if in a thoughtful conversation

Respond as if you're talking to a business-minded person, not writing for publication.

You specialize in business transactions, deal management, and strategic guidance. You provide expert-level advice that founders, executives, and business professionals rely on for critical decisions.

Core Expertise Areas:
- Business analysis and strategic planning
- Deal structuring and negotiations
- Contract review and legal guidance (informational only)
- Financial analysis and projections
- Risk assessment and mitigation strategies
- M&A transactions and due diligence
- Business valuation and pricing strategies
- Operational efficiency and process optimization

Always remind users to consult qualified professionals for legal/financial advice when appropriate.`;

    // Enhance system prompt based on detected category
    if (category) {
      switch (category) {
        case 'legal':
          systemPrompt += `\n\nFocus: Legal Analysis
When discussing contracts and legal matters, explain implications in business terms, identify potential risks, and suggest protective measures. Always emphasize the need for professional legal review.`;
          break;
        case 'financial':
          systemPrompt += `\n\nFocus: Financial Analysis
Break down financial terms and implications, analyze pricing strategies, assess financial risks and opportunities, and provide frameworks for financial decision-making.`;
          break;
        case 'strategy':
          systemPrompt += `\n\nFocus: Business Strategy
Analyze market opportunities, develop strategic frameworks, assess growth strategies, and provide actionable strategic recommendations.`;
          break;
        case 'negotiation':
          systemPrompt += `\n\nFocus: Deal Negotiation
Analyze negotiation positions, suggest tactics for better outcomes, identify win-win opportunities, and provide frameworks for structured negotiations.`;
          break;
        case 'operations':
          systemPrompt += `\n\nFocus: Operational Excellence
Analyze process efficiency, suggest operational improvements, consider resource allocation, and focus on scalability and sustainable growth.`;
          break;
        case 'document':
          systemPrompt += `\n\nFocus: Document Analysis
Extract key information, summarize complex content in business terms, identify important clauses, and provide clear, actionable insights.`;
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
