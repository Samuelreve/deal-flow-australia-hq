
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ExtractionRequest {
  filePath: string;
  fileName: string;
  mimeType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { filePath, fileName, mimeType }: ExtractionRequest = await req.json();

    if (!filePath || !fileName || !mimeType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: filePath, fileName, mimeType' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('contracts')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('File download error:', downloadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to download file from storage' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let extractedText = '';

    try {
      if (mimeType === 'text/plain' || mimeType === 'text/rtf' || mimeType === 'application/rtf') {
        // Handle text files directly
        extractedText = await fileData.text();
        
      } else if (mimeType === 'application/pdf') {
        // For PDF files, we'll use a simple extraction approach
        // In a production environment, you'd use a proper PDF parsing library
        const arrayBuffer = await fileData.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Simple PDF text extraction (basic approach)
        // This is a placeholder - in production, use pdf-parse or similar
        const textDecoder = new TextDecoder('utf-8');
        const pdfContent = textDecoder.decode(uint8Array);
        
        // Extract readable text from PDF (very basic approach)
        // This won't work perfectly but provides a fallback
        const textMatch = pdfContent.match(/\(([^)]+)\)/g);
        if (textMatch) {
          extractedText = textMatch
            .map(match => match.slice(1, -1))
            .join(' ')
            .replace(/\\[rn]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        if (!extractedText || extractedText.length < 50) {
          extractedText = `PDF document "${fileName}" uploaded successfully. Advanced PDF text extraction requires additional processing. This is a ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB PDF file.`;
        }
        
        
      } else if (mimeType.includes('officedocument.wordprocessingml') || mimeType === 'application/msword') {
        // For Word documents, we'll provide a placeholder approach
        // In production, you'd use mammoth.js or similar
        const arrayBuffer = await fileData.arrayBuffer();
        
        // Basic Word document handling (placeholder)
        extractedText = `Word document "${fileName}" uploaded successfully. Advanced Word document text extraction requires additional processing. This is a ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB Word document.`;
        
        
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      // Ensure we have some text content
      if (!extractedText || extractedText.trim().length === 0) {
        extractedText = `Document "${fileName}" was uploaded but no text content could be extracted. File size: ${(fileData.size / 1024).toFixed(1)}KB.`;
      }

      return new Response(
        JSON.stringify({
          success: true,
          text: extractedText,
          metadata: {
            fileName,
            mimeType,
            fileSize: fileData.size,
            extractedLength: extractedText.length
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      
      // Provide fallback content even if extraction fails
      const fallbackText = `Document "${fileName}" (${mimeType}) was uploaded successfully but text extraction encountered an error. The file is saved and available for download. Consider uploading a plain text version for immediate text analysis.`;
      
      return new Response(
        JSON.stringify({
          success: false,
          error: extractionError.message,
          fallbackText,
          metadata: {
            fileName,
            mimeType,
            fileSize: fileData.size
          }
        }),
        { 
          status: 200, // Return 200 with error info so client can handle gracefully
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Text extraction function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during text extraction' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
