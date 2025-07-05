import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import proper text extraction libraries
import pdfParse from "npm:pdf-parse@1.1.1";
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
    // Parse request body
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

    const fileBuffer = decodeBase64(fileBase64);
    console.log('📄 File buffer created, size:', fileBuffer.length, 'bytes');
    
    let extractedText: string;

    // Extract text based on mime type
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/html') {
      const decoder = new TextDecoder();
      extractedText = decoder.decode(fileBuffer);
    } 
    else if (mimeType === 'application/pdf') {
      // Use pdf-parse for proper PDF text extraction
      console.log('📄 Using pdf-parse for PDF text extraction...');
      try {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
        console.log(`✅ PDF extraction successful: ${extractedText.length} characters extracted`);
        
        if (!extractedText || extractedText.trim().length < 20) {
          throw new Error('Insufficient text extracted from PDF');
        }
      } catch (error) {
        console.error('❌ pdf-parse failed:', error);
        extractedText = `[PDF Document: ${fileName}]\n\nPDF text extraction failed. Document may be image-based or encrypted.`;
      }
    } 
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Use mammoth.js for proper DOCX text extraction
      console.log('📄 Using mammoth.js for DOCX text extraction...');
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
        console.log(`✅ DOCX extraction successful: ${extractedText.length} characters extracted`);
        
        if (result.messages && result.messages.length > 0) {
          console.log('📝 Mammoth messages:', result.messages);
        }
        
        if (!extractedText || extractedText.trim().length < 20) {
          throw new Error('Insufficient text extracted from DOCX');
        }
      } catch (error) {
        console.error('❌ mammoth.js failed:', error);
        extractedText = `[Word Document: ${fileName}]\n\nDOCX text extraction failed.`;
      }
    }
    else if (mimeType === 'application/msword') {
      extractedText = `[Word Document: ${fileName}]\n\nLegacy DOC format requires conversion to DOCX or TXT.`;
    }
    else if (mimeType === 'application/rtf' || mimeType === 'text/rtf') {
      const decoder = new TextDecoder();
      const rtfContent = decoder.decode(fileBuffer);
      extractedText = stripRtfFormatting(rtfContent);
      console.log(`✅ RTF extraction completed: ${extractedText.length} characters extracted`);
    }
    else {
      return new Response(
        JSON.stringify({ success: false, error: `Unsupported document type: ${mimeType}` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `[Document: ${fileName}]\n\nNo readable text could be extracted.`;
    }

    return new Response(
      JSON.stringify({ success: true, text: extractedText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Text extraction error:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Text extraction failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to decode base64
function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Strip RTF formatting to get plain text
function stripRtfFormatting(rtfContent: string): string {
  try {
    let plainText = rtfContent
      .replace(/\{\\rtf1[^}]*\}/g, '')
      .replace(/\{\\[^}]*\}/g, '')
      .replace(/\\[a-z]+\d*\s?/gi, '')
      .replace(/\{|\}/g, '')
      .replace(/\\\\/g, '\\')
      .replace(/\\'/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
      
    return plainText;
  } catch (e) {
    console.error("Error stripping RTF formatting:", e);
    return rtfContent;
  }
}