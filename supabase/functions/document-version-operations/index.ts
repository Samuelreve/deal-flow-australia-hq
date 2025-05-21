
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, handleCorsRequest } from "./utils/cors.ts";
import { verifyVersionBelongsToDeal } from "./utils/validation.ts";
import { getDocumentContent } from "./operations/document-content.ts";
import { compareVersions } from "./operations/compare-versions.ts";
import { getAISummaryOfChanges } from "./operations/ai-summary.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) {
    return corsResponse;
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { operation, currentVersionId, previousVersionId, dealId } = await req.json();
    
    if (!operation || !currentVersionId || !previousVersionId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Verify document versions belong to the deal
    const currentVersionValid = await verifyVersionBelongsToDeal(supabase, currentVersionId, dealId);
    const previousVersionValid = await verifyVersionBelongsToDeal(supabase, previousVersionId, dealId);
    
    if (!currentVersionValid || !previousVersionValid) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to document versions' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process based on operation type
    if (operation === 'compare') {
      // Fetch document content for both versions
      const currentVersionContent = await getDocumentContent(supabase, dealId, currentVersionId);
      const previousVersionContent = await getDocumentContent(supabase, dealId, previousVersionId);
      
      // Compare the versions
      const comparisonResult = compareVersions(currentVersionContent, previousVersionContent);
      
      return new Response(
        JSON.stringify({ result: comparisonResult }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (operation === 'summarize_changes') {
      if (!openAIKey) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Fetch document content for both versions
      const currentVersionContent = await getDocumentContent(supabase, dealId, currentVersionId);
      const previousVersionContent = await getDocumentContent(supabase, dealId, previousVersionId);
      
      // Get AI summary of changes
      const summary = await getAISummaryOfChanges(
        currentVersionContent, 
        previousVersionContent, 
        openAIKey
      );
      
      return new Response(
        JSON.stringify({
          summary: summary.summary,
          disclaimer: summary.disclaimer
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid operation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in document-version-operations function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
