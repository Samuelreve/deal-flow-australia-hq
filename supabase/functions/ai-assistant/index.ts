
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const { message, category, documentContext } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    console.log('Processing AI business request:', { message: message.substring(0, 100), category, hasDocument: !!documentContext });

    // Import enhanced system prompt
    const { AI_ASSISTANT_SYSTEM_PROMPT, CATEGORY_ENHANCEMENTS } = await import("../_shared/ai-prompts.ts");
    
    // Build conversational system prompt based on category
    let systemPrompt = AI_ASSISTANT_SYSTEM_PROMPT;

    // Enhance system prompt based on detected category
    if (category && CATEGORY_ENHANCEMENTS[category]) {
      systemPrompt += "\n" + CATEGORY_ENHANCEMENTS[category];
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
