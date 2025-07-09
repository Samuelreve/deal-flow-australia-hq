
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { createCorsResponse } from "./utils/response-handler.ts";
import { handleRequest } from "./request-handler.ts";

console.log('Document AI Assistant function starting...');

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!openAIApiKey) {
  console.error('OPENAI_API_KEY not found in environment variables');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration not found in environment variables');
}

serve(async (req) => {
  console.log('Document AI Assistant request received:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  // Validate required environment variables
  if (!openAIApiKey) {
    console.error('Missing OPENAI_API_KEY');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    return new Response(
      JSON.stringify({ error: 'Supabase configuration missing' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: openAIApiKey
  });
  
  try {
    return await handleRequest(req, openai, supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Unhandled error in document AI assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
