
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get the document analysis request
    const { documentId, analysisType } = await req.json();

    if (!documentId || !analysisType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Fetch the document
    const { data: document, error: documentError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Fetch the document content (this is a placeholder - in a real app, you would get the actual content)
    const documentContent = "Sample document content for analysis";

    // Analyze the document (this is a placeholder for the actual analysis logic)
    const analysisResult = await analyzeDocument(documentContent, analysisType);

    // Save the analysis result
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from('document_analyses')
      .insert({
        document_id: documentId,
        document_version_id: document.latest_version_id,
        created_by: session.user.id,
        analysis_type: analysisType,
        analysis_content: analysisResult
      })
      .select()
      .single();

    if (saveError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis', details: saveError }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    return new Response(
      JSON.stringify(savedAnalysis),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

// Placeholder for document analysis logic
async function analyzeDocument(content: string, analysisType: string) {
  // In a real application, you would use an AI service or implement custom logic
  // based on the analysis type
  
  let result;
  switch (analysisType) {
    case 'summary':
      result = {
        summary: "This is a summary of the document content.",
        key_points: [
          "Key point 1",
          "Key point 2",
          "Key point 3"
        ],
        word_count: content.split(' ').length,
        analyzed_at: new Date().toISOString()
      };
      break;
    case 'legal_compliance':
      result = {
        compliance_score: 85,
        issues: [
          {
            severity: "medium",
            description: "Potential compliance issue in section 2.1",
            recommendation: "Review section 2.1 to ensure compliance with current regulations"
          },
          {
            severity: "low",
            description: "Minor formatting issue in section 5",
            recommendation: "Standardize formatting for better clarity"
          }
        ],
        analyzed_at: new Date().toISOString()
      };
      break;
    case 'risks':
      result = {
        risk_score: 42,
        identified_risks: [
          {
            risk_level: "high",
            description: "Ambiguous payment terms",
            location: "Section 3.2",
            recommendation: "Clarify payment terms and conditions"
          },
          {
            risk_level: "medium",
            description: "Unclear liability clause",
            location: "Section 7.1",
            recommendation: "Explicitly define liability limitations"
          }
        ],
        analyzed_at: new Date().toISOString()
      };
      break;
    default:
      result = {
        message: "Basic analysis completed",
        analyzed_at: new Date().toISOString()
      };
  }
  
  // Simulate analysis time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return result;
}
