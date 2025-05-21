
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealId, documentId, documentVersionId } = await req.json();
    
    if (!dealId || !documentId || !documentVersionId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: dealId, documentId, or documentVersionId" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the document version details
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', documentVersionId)
      .eq('document_id', documentId)
      .single();
    
    if (versionError || !versionData) {
      console.error("Error fetching version:", versionError);
      return new Response(
        JSON.stringify({ error: "Could not fetch document version" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a signed URL for the document
    const { data: urlData, error: urlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${versionData.storage_path}`, 60);
    
    if (urlError || !urlData?.signedUrl) {
      console.error("Error creating signed URL:", urlError);
      return new Response(
        JSON.stringify({ error: "Could not access document" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch the document content
    const fileResponse = await fetch(urlData.signedUrl);
    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Could not download document content" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw text content
    // Note: For PDFs or Word docs, would need additional library for text extraction
    // This is simplified for demonstration
    let documentContent = "";
    
    // For text files or simple formats
    if (versionData.type === 'text/plain') {
      documentContent = await fileResponse.text();
    } else {
      // For this version, handle only basic text documents
      // Would need OCR/extraction for PDFs/DOCXs in production
      documentContent = "Document content extraction not supported for this file type.";
    }
    
    // Call OpenAI for contract summarization
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are a legal assistant. Summarize the key terms and sections of the following contract document in simple, non-legal terms.
            Then, list the parties involved, the contract type (e.g., Asset Purchase Agreement, Lease Agreement), any key obligations, timelines, termination rules, and liabilities explicitly mentioned.
            
            Answer ONLY using what is explicitly stated in the document.
            Do NOT invent information or speculate.
            Do NOT provide legal advice; state that you are an informational tool.
            If the answer is NOT explicitly available, state 'I cannot find that information in the provided text.'
            Highlight any unclear or ambiguous language if found.` 
          },
          { 
            role: "user", 
            content: `Contract Document Content:\n${documentContent}\n\nProvide the summary and key points in a clear, structured format.` 
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const openAIData = await openAIResponse.json();
    
    if (openAIData.error) {
      console.error("OpenAI API error:", openAIData.error);
      return new Response(
        JSON.stringify({ error: "Error from AI service", details: openAIData.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the summary content
    const summaryContent = openAIData.choices[0].message.content;
    
    // Store the analysis result in the database
    const { data: analysisData, error: analysisError } = await supabase
      .from('document_analyses')
      .insert({
        document_id: documentId,
        document_version_id: documentVersionId,
        analysis_type: 'summary',
        analysis_content: summaryContent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (analysisError) {
      console.warn("Warning: Could not save analysis to database:", analysisError);
      // Continue anyway to return results to user
    }

    return new Response(
      JSON.stringify({
        summary: summaryContent,
        analysisId: analysisData?.id,
        disclaimer: "This summary is provided for informational purposes only and is not legal advice. Always consult with a qualified legal professional for advice on contracts and legal matters."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in summarize-contract function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
