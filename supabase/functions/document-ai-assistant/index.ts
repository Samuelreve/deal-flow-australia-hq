
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createCorsResponse } from "./utils/response-handler.ts";
import { handleRequest } from "./request-handler.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  // We no longer need the OpenAI client since we're using direct fetch calls
  // Pass null as the openai parameter since the operations handle API calls directly
  return handleRequest(req, null, supabaseUrl, supabaseKey);
});
