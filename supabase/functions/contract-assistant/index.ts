import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openAIApiKey
});

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    // Parse request body
    const { question, contractText } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!contractText) {
      return new Response(
        JSON.stringify({ error: 'Contract text is required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a system prompt that instructs the AI how to analyze the contract
    const systemPrompt = `
      You are ContractGPT, an AI assistant specialized in analyzing legal contracts.
      You will be given a contract text and a question about it.
      
      Guidelines:
      1. Answer questions based ONLY on the contract text provided.
      2. Cite specific sections, clauses, or page numbers as sources when possible.
      3. If the answer cannot be found in the contract, clearly state this.
      4. Be concise and direct in your answers.
      5. Provide factual information only, without giving legal advice.
      6. Format important terms, dates, or monetary values in bold for emphasis.
      
      Disclaimer: Your answers are for informational purposes only and do not constitute legal advice.
    `;

    // Create a prompt that combines the contract text and question
    const userPrompt = `
      CONTRACT TEXT:
      ${contractText}
      
      QUESTION:
      ${question}
      
      Please answer the question based only on the contract text provided.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });
    
    // Extract the AI's answer
    const aiAnswer = response.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";
    
    // Use regex to extract sources
    const sourcesRegex = /Source(?:s)?:\s*(.*?)(?:\n\n|$)/gs;
    const sourcesMatch = sourcesRegex.exec(aiAnswer);
    
    const sources = sourcesMatch 
      ? sourcesMatch[1]
          .split(/,|\n/)
          .map(source => source.trim())
          .filter(source => source.length > 0)
      : [];

    // Format the final answer by removing the "Sources:" section
    const formattedAnswer = aiAnswer.replace(sourcesRegex, '').trim();

    // Create Supabase client for saving the Q&A
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Save the question and answer in the database (fire and forget)
          EdgeRuntime.waitUntil(saveQuestionAnswer(supabase, {
            userId: user.id,
            question,
            answer: formattedAnswer,
            sources
          }));
        }
      } catch (error) {
        console.error("Error getting user:", error);
        // Continue without saving if user auth fails
      }
    }
    
    // Return the formatted answer and sources
    return new Response(
      JSON.stringify({
        answer: formattedAnswer,
        sources: sources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contract assistant error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process your request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to save question and answer in the database
async function saveQuestionAnswer(
  supabase: any, 
  { userId, question, answer, sources, contractId }: 
  { userId: string, question: string, answer: string, sources: string[], contractId?: string }
) {
  try {
    // If we have a contractId, save to contract_questions table
    if (contractId) {
      await supabase.from('contract_questions').insert({
        contract_id: contractId,
        user_id: userId,
        question,
        answer,
        sources: sources
      });
    }
    
    // Otherwise just log that we're not saving because we don't have a contractId
    else {
      console.log('No contractId provided, not saving question/answer');
    }
  } catch (error) {
    console.error('Error saving question/answer:', error);
  }
}
