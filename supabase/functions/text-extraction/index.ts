
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { contractId, filePath } = await req.json();
    
    if (!contractId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Contract ID and file path are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('contracts')
      .download(filePath);

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // For now, we'll handle text files and basic extraction
    // In a real implementation, you'd use libraries like pdf-parse for PDFs
    let extractedText = '';
    
    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const textDecoder = new TextDecoder();
      extractedText = textDecoder.decode(arrayBuffer);
    } catch (error) {
      // If it's not a text file, provide a fallback message
      extractedText = "Document content extraction not yet implemented for this file type. Please use the question/answer feature to analyze the document.";
    }

    // Update contract with extracted text
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ 
        content: extractedText,
        analysis_status: 'completed'
      })
      .eq('id', contractId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating contract:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update contract' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : '')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Text extraction error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
