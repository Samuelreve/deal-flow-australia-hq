
// Edge Function to retrieve document content for comparison or analysis

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders, 
      status: 204 
    });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { versionId, dealId } = await req.json();
    
    if (!versionId || !dealId) {
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

    // 1. Get version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id, storage_path, type')
      .eq('id', versionId)
      .single();
      
    if (versionError || !version) {
      throw new Error('Version not found');
    }

    // 2. Get the document to verify it belongs to the deal
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', version.document_id)
      .eq('deal_id', dealId)
      .single();
      
    if (documentError || !document) {
      throw new Error('Document not found or not part of the specified deal');
    }

    // 3. Download the file
    const dealBucket = 'deal-documents'; // Replace with your bucket name
    const { data: fileData, error: fileError } = await supabase.storage
      .from(dealBucket)
      .download(`${dealId}/${version.storage_path}`);
      
    if (fileError || !fileData) {
      throw new Error('Failed to download file');
    }

    // 4. Convert file to text
    let content: string;
    
    // Handle different file types
    if (version.type === 'application/pdf') {
      // For PDFs, we would need PDF.js or similar to extract text
      // This is a simplified example
      content = await fileData.text();
    } else if (
      version.type === 'text/plain' || 
      version.type === 'text/markdown' ||
      version.type === 'text/html' ||
      version.type.includes('text/')
    ) {
      content = await fileData.text();
    } else if (
      version.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      version.type === 'application/msword'
    ) {
      // For Word docs, we'd need a specialized parser
      content = "Word document content extraction not supported in this example";
    } else {
      // Fallback for other file types
      content = await fileData.text();
    }

    return new Response(
      JSON.stringify({
        content,
        mimeType: version.type,
        documentId: version.document_id,
        versionId
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error retrieving document content:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while retrieving document content' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
