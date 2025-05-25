
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createCorsResponse } from "./utils/response-handler.ts";
import { handleRequest } from "./request-handler.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  // Initialize OpenAI client with only API key - no project association
  const openai = new OpenAI({
    apiKey: openAIApiKey,
    // Explicitly don't set project or organization to avoid project association issues
  });
  
  return handleRequest(req, openai, supabaseUrl, supabaseKey);
});
