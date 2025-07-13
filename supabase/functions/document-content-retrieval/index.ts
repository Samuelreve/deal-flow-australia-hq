
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

    // 3. First try to get extracted text content from database
    const { data: versionWithText, error: textError } = await supabase
      .from('document_versions')
      .select('text_content')
      .eq('id', versionId)
      .single();
    
    if (!textError && versionWithText?.text_content && 
        typeof versionWithText.text_content === 'string' && 
        versionWithText.text_content.trim() !== '' &&
        versionWithText.text_content !== '[object Object]') {
      console.log('Found valid extracted text content in database');
      return new Response(
        JSON.stringify({
          content: versionWithText.text_content,
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
    }

    console.log('No extracted text found in database, attempting file download...');

    // 4. Download the file from storage
    const dealBucket = 'deal_documents'; // Use the correct bucket name
    
    // Try different path combinations
    const possiblePaths = [
      `${dealId}/${version.storage_path}`,
      version.storage_path,
      `${version.storage_path}`
    ];
    
    let fileData: Blob | null = null;
    let successfulPath = '';
    
    for (const path of possiblePaths) {
      console.log(`Trying to download from path: ${path}`);
      const { data, error } = await supabase.storage
        .from(dealBucket)
        .download(path);
      
      if (!error && data) {
        fileData = data;
        successfulPath = path;
        console.log(`Successfully downloaded from: ${path}`);
        break;
      } else {
        console.log(`Failed to download from ${path}:`, error?.message);
      }
    }
    
    if (!fileData) {
      throw new Error(`Failed to download file from any of the attempted paths: ${possiblePaths.join(', ')}`);
    }

    // 5. Extract text using the text-extractor function
    console.log(`Converting file to base64 for text extraction...`);
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid call stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    
    console.log('Calling text-extractor function...');
    
    // Add timeout protection for large files
    const extractionPromise = supabase.functions
      .invoke('text-extractor', {
        body: {
          fileBase64: base64,
          mimeType: version.type,
          fileName: version.storage_path.split('/').pop() || 'document'
        }
      });
    
    // Set a 45-second timeout for text extraction
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Text extraction timeout')), 45000)
    );
    
    let extractionResult;
    let extractionError;
    
    try {
      const { data, error } = await Promise.race([extractionPromise, timeoutPromise]);
      extractionResult = data;
      extractionError = error;
    } catch (timeoutError) {
      console.error('Text extraction timed out:', timeoutError);
      extractionError = timeoutError;
    }
    
    let content = '';
    if (extractionError) {
      console.error('Text extraction failed:', extractionError);
      // For PDFs that fail, try a fallback simple text extraction
      if (version.type.includes('pdf')) {
        console.log('Attempting fallback PDF text extraction...');
        try {
          const fallbackText = new TextDecoder('utf-8', { ignoreBOM: true }).decode(arrayBuffer);
          // Very basic text extraction - look for readable text patterns
          const cleanText = fallbackText
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanText.length > 100) {
            content = cleanText.substring(0, 10000); // Limit to first 10k chars
            console.log('Fallback extraction yielded:', content.length, 'characters');
          } else {
            content = 'Text extraction failed for this document type. Please ensure the PDF contains extractable text.';
          }
        } catch (fallbackError) {
          console.error('Fallback extraction failed:', fallbackError);
          content = 'Text extraction failed for this document type.';
        }
      } else {
        content = 'Text extraction failed for this document type.';
      }
    } else if (extractionResult?.success && extractionResult?.text) {
      // Properly handle the extracted text - ensure it's a string
      let extractedText = extractionResult.text;
      
      // If it's an object, try to extract the actual text content
      if (typeof extractedText === 'object') {
        console.log('Extracted text is an object:', extractedText);
        
        // Try common object properties that might contain text
        if (extractedText.content) {
          extractedText = extractedText.content;
        } else if (extractedText.text) {
          extractedText = extractedText.text;
        } else if (extractedText.data) {
          extractedText = extractedText.data;
        } else {
          // If we can't find text content, stringify and log the object
          console.error('Cannot extract text from object:', JSON.stringify(extractedText, null, 2));
          extractedText = 'Unable to extract readable text from this document format.';
        }
      }
      
      // Ensure we have a string
      content = typeof extractedText === 'string' ? extractedText : String(extractedText);
      console.log('Text extraction successful:', content.length, 'characters');
      console.log('First 200 chars of extracted text:', content.substring(0, 200));
      
      // Save extracted text back to database for future use
      await supabase
        .from('document_versions')
        .update({ text_content: content })
        .eq('id', versionId);
    } else {
      console.log('No text content extracted:', extractionResult);
      content = 'No readable text content found in this document.';
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
