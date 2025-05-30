
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractAssistantRequest {
  question: string;
  contractText: string;
  contractId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const { question, contractText, contractId }: ContractAssistantRequest = await req.json();

    if (!question || !contractText) {
      return new Response(
        JSON.stringify({ error: 'Question and contract text are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Processing contract question:', question.substring(0, 100));

    const openai = new OpenAI({ apiKey: openAIApiKey });

    // Create a system prompt for contract analysis
    const systemPrompt = `You are a professional legal document analyst. Your role is to analyze contracts and legal documents to answer questions accurately and professionally.

When analyzing contracts, you should:
1. Provide clear, direct answers based on the contract content
2. Quote relevant sections when applicable
3. Identify potential risks or important considerations
4. Use professional legal terminology appropriately
5. If information is not in the contract, clearly state that

Format your responses to be clear and well-structured. Use plain English while maintaining professional accuracy.

IMPORTANT: Always base your answers strictly on the provided contract content. Do not make assumptions about clauses not present in the document.`;

    const userPrompt = `Please analyze the following contract and answer this question: "${question}"

CONTRACT CONTENT:
${contractText}

Please provide a comprehensive answer based on the contract content above.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const answer = completion.choices[0]?.message?.content || "I couldn't process your question. Please try again.";

    // Save the Q&A to database for history
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      const { error: saveError } = await supabase
        .from('contract_questions')
        .insert({
          contract_id: contractId,
          question: question,
          answer: answer,
          sources: []
        });

      if (saveError) {
        console.error('Failed to save Q&A to database:', saveError);
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return new Response(
      JSON.stringify({
        answer,
        sources: ['AI Analysis of Contract Document'],
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Contract assistant error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process question',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
