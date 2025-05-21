
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Set up internal authentication - make sure we add a secret for this
const INTERNAL_API_KEY = Deno.env.get('TEXT_EXTRACTOR_API_KEY') || '';

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
    // Validate internal API key
    const authHeader = req.headers.get('Authorization');
    const providedApiKey = authHeader?.split(' ')[1];
    
    if (!providedApiKey || providedApiKey !== INTERNAL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Invalid internal API key.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { fileBase64, mimeType } = await req.json();

    if (!fileBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing file content or mimeType.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileBuffer = decodeBase64(fileBase64);
    let extractedText: string;

    // Extract text based on mime type
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/html') {
      const decoder = new TextDecoder();
      extractedText = decoder.decode(fileBuffer);
    } 
    else if (mimeType === 'application/pdf') {
      // For now, extract basic text from PDFs
      // This is a placeholder implementation that tries to extract some readable text
      const decoder = new TextDecoder();
      const rawText = decoder.decode(fileBuffer);
      
      // Try to find readable text segments in the PDF content
      extractedText = extractReadableTextFromPDF(rawText);
      
      // If we couldn't extract meaningful text
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = "[PDF text extraction limited. This PDF may be scanned/image-based or requires specialized parsing.]";
      }
    } 
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX, try to extract text from the XML content
      const decoder = new TextDecoder();
      const rawContent = decoder.decode(fileBuffer);
      
      // DOCX files are zip archives with XML files inside
      // Try to extract text from document.xml which contains the main content
      extractedText = extractTextFromDocx(rawContent);
      
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = "[DOCX text extraction limited. This document may require specialized parsing.]";
      }
    }
    else if (mimeType === 'application/rtf' || mimeType === 'text/rtf') {
      // Very basic RTF text extraction
      const decoder = new TextDecoder();
      const rtfContent = decoder.decode(fileBuffer);
      extractedText = stripRtfFormatting(rtfContent);
    }
    else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unsupported document type for text extraction: ${mimeType}` 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, text: extractedText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Text extraction error:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Text extraction failed: ${error.message || error}` }),
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

// Basic function to extract readable text from PDF content
function extractReadableTextFromPDF(rawContent: string): string {
  try {
    // Look for text patterns in the PDF content
    // This is a very simplified approach and won't work for all PDFs
    const textBlocks: string[] = [];
    
    // Try to find text blocks between common PDF text markers
    // This is a simple heuristic that works for some PDFs
    const textPattern = /\(([^)]+)\)Tj/g;
    let match;
    
    while ((match = textPattern.exec(rawContent)) !== null) {
      if (match[1] && match[1].length > 1) {
        // Clean up escape sequences and non-printable characters
        const cleanText = match[1]
          .replace(/\\r|\\n/g, ' ')  // Replace escape sequences
          .replace(/[^\x20-\x7E]/g, ' ');  // Keep only printable ASCII
        
        if (cleanText.trim().length > 0) {
          textBlocks.push(cleanText);
        }
      }
    }
    
    return textBlocks.join('\n');
  } catch (e) {
    console.error("Error extracting text from PDF:", e);
    return "";
  }
}

// Basic function to extract text from DOCX content
function extractTextFromDocx(rawContent: string): string {
  try {
    // DOCX files are ZIP archives with XML documents
    // This is a very simplified approach to extract some text
    // Look for text between <w:t> tags which contain the actual text content
    const textPattern = /<w:t[^>]*>(.*?)<\/w:t>/g;
    const paragraphPattern = /<\/w:p>/g;
    
    // Replace paragraph ends with newlines and extract text
    let text = rawContent.replace(paragraphPattern, '\n');
    const textMatches = text.matchAll(textPattern);
    
    const extractedText = Array.from(textMatches)
      .map(match => match[1])
      .join(' ');
      
    return extractedText;
  } catch (e) {
    console.error("Error extracting text from DOCX:", e);
    return "";
  }
}

// Strip RTF formatting to get plain text
function stripRtfFormatting(rtfContent: string): string {
  try {
    // Very basic RTF stripping - this won't work for all RTF features
    // but should extract basic text
    
    // Remove RTF headers and commands
    let plainText = rtfContent
      .replace(/\{\\rtf1.*?\\viewkind4/, '') // Remove header
      .replace(/\\\w+\s?/g, '')  // Remove commands like \par
      .replace(/\{|\}/g, '')     // Remove braces
      .replace(/\\['"]/g, '"')   // Replace escaped quotes
      .replace(/\\\\/g, '\\')    // Replace escaped backslashes
      .replace(/\\[^a-zA-Z0-9]/g, '$1'); // Keep special chars after backslash
      
    return plainText;
  } catch (e) {
    console.error("Error stripping RTF formatting:", e);
    return rtfContent; // Return the original content if something goes wrong
  }
}
