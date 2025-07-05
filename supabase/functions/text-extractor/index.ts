import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Use unpdf for better PDF extraction in serverless environments
import { extractText as extractPdfText } from "npm:unpdf@0.11.0";
// Use mammoth for DOCX extraction
import mammoth from "npm:mammoth@1.6.0";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { fileBase64, mimeType, fileName } = await req.json();
    
    console.log('🔧 Text extraction request:', {
      fileName,
      mimeType,
      base64Length: fileBase64?.length || 0
    });

    if (!fileBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing file content or mimeType.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert base64 to buffer
    const fileBuffer = new Uint8Array(
      atob(fileBase64)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    console.log('📄 File buffer created, size:', fileBuffer.length, 'bytes');
    
    let extractedText: string = '';
    
    // Extract text based on file type
    if (mimeType === 'text/plain') {
      console.log('📄 Processing plain text file...');
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(fileBuffer);
      console.log(`✅ Plain text extraction: ${extractedText.length} characters`);
    }
    else if (mimeType === 'application/pdf') {
      console.log('📄 Processing PDF with unpdf...');
      try {
        // Use unpdf which is optimized for edge functions
        const { text } = await extractPdfText(fileBuffer);
        extractedText = text || '';
        
        console.log(`✅ PDF extraction successful: ${extractedText.length} characters`);
        
        // Clean up extracted text
        extractedText = cleanExtractedText(extractedText);
        
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text extracted from PDF');
        }
      } catch (error) {
        console.error('❌ PDF extraction failed:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `PDF text extraction failed: ${error.message}. This may be a scanned PDF or contain only images.` 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('📄 Processing DOCX with mammoth...');
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value || '';
        
        console.log(`✅ DOCX extraction successful: ${extractedText.length} characters`);
        
        if (result.messages && result.messages.length > 0) {
          console.log('📝 Mammoth messages:', result.messages);
        }
        
        // Clean up extracted text
        extractedText = cleanExtractedText(extractedText);
        
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text extracted from DOCX');
        }
      } catch (error) {
        console.error('❌ DOCX extraction failed:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `DOCX text extraction failed: ${error.message}` 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    else if (mimeType === 'application/rtf' || mimeType === 'text/rtf') {
      console.log('📄 Processing RTF file...');
      try {
        const decoder = new TextDecoder('utf-8');
        const rtfContent = decoder.decode(fileBuffer);
        extractedText = extractRtfText(rtfContent);
        
        console.log(`✅ RTF extraction completed: ${extractedText.length} characters`);
        
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text extracted from RTF');
        }
      } catch (error) {
        console.error('❌ RTF extraction failed:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `RTF text extraction failed: ${error.message}` 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    else if (mimeType === 'application/msword') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Legacy DOC format is not supported. Please convert to DOCX, PDF, or TXT format.' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unsupported file type: ${mimeType}. Supported formats: PDF, DOCX, RTF, and TXT.` 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Final validation
    if (!extractedText || extractedText.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No readable text could be extracted from the document.' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎉 Text extraction completed successfully: ${extractedText.length} characters`);
    console.log('📋 Text preview:', extractedText.substring(0, 200) + '...');

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        extractedLength: extractedText.length,
        fileName: fileName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Text extraction error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Text extraction failed: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
}

/**
 * Extract text from RTF content using improved parsing
 */
function extractRtfText(rtfContent: string): string {
  try {
    let text = rtfContent;
    
    // Remove RTF header
    text = text.replace(/^\{\\rtf1[^{}]*\}/, '');
    
    // Remove font table
    text = text.replace(/\{\\fonttbl[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
    
    // Remove color table
    text = text.replace(/\{\\colortbl[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
    
    // Remove style sheet
    text = text.replace(/\{\\stylesheet[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
    
    // Remove info group
    text = text.replace(/\{\\info[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
    
    // Remove other control groups
    text = text.replace(/\{\\[^{}]*\}/g, '');
    
    // Remove control words with parameters
    text = text.replace(/\\[a-z]+\d*\s?/gi, ' ');
    
    // Remove control symbols
    text = text.replace(/\\[^a-z]/gi, '');
    
    // Remove remaining braces
    text = text.replace(/[{}]/g, '');
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  } catch (error) {
    console.error('Error parsing RTF:', error);
    // Fallback: simple brace and backslash removal
    return rtfContent
      .replace(/\{[^}]*\}/g, '')
      .replace(/\\[a-z]+\d*\s?/gi, ' ')
      .replace(/[{}\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}