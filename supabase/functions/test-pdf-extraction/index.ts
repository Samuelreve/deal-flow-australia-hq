import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the contract data
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, name, content, text_content, extraction_status')
      .eq('id', '46f00fe0-eacb-40fc-a514-f71d24f63e5d')
      .single();

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ error: 'Contract not found', details: contractError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Extract text from the PDF content
    const content = contract.content;
    console.log("🔧 Starting PDF text extraction, content length:", content.length);
    
    let extractedContent = '';
    
    // Look for text objects and parentheses content
    const textObjects = content.match(/\([^)]+\)/g);
    if (textObjects && textObjects.length > 0) {
      extractedContent = textObjects
        .map(match => match.replace(/[()]/g, ''))
        .filter(text => text.length > 1 && /[a-zA-Z]/.test(text))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log("📝 Text objects found:", textObjects.length, "extracted length:", extractedContent.length);
    }
    
    // Also look for readable ASCII text scattered throughout
    if (extractedContent.length < 100) {
      const readableChunks = [];
      const lines = content.split(/[\r\n]+/);
      
      for (const line of lines) {
        // Extract readable text from each line
        const readable = line.replace(/[^\x20-\x7E]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (readable.length > 10 && /[a-zA-Z]{3,}/.test(readable)) {
          readableChunks.push(readable);
        }
      }
      
      if (readableChunks.length > 0) {
        const combinedText = readableChunks.join(' ').substring(0, 5000);
        if (combinedText.length > extractedContent.length) {
          extractedContent = combinedText;
        }
      }
    }
    
    // Final attempt: scan for any meaningful text patterns
    if (extractedContent.length < 50) {
      const meaningfulWords = content.match(/\b[A-Za-z]{3,}\b/g);
      if (meaningfulWords && meaningfulWords.length > 10) {
        extractedContent = meaningfulWords.slice(0, 200).join(' ');
        console.log("📝 Extracted words from PDF:", meaningfulWords.length, "total words");
      }
    }
    
    console.log("📊 Final PDF extraction result:", extractedContent.length, "characters");
    
    // Update the contract with extracted text
    if (extractedContent.length > 50) {
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ 
          text_content: extractedContent, 
          extraction_status: 'completed' 
        })
        .eq('id', contract.id);
      
      if (updateError) {
        console.error("❌ Failed to update contract:", updateError);
      } else {
        console.log("✅ Contract updated successfully");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        contract: {
          id: contract.id,
          name: contract.name,
          original_text_content: contract.text_content,
          original_extraction_status: contract.extraction_status
        },
        extraction_result: {
          text_objects_found: textObjects?.length || 0,
          extracted_length: extractedContent.length,
          extracted_text: extractedContent.substring(0, 1000) + (extractedContent.length > 1000 ? '...' : ''),
          full_text: extractedContent
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("❌ Error in test-pdf-extraction:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to extract PDF text', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});