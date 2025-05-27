
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
      // Enhanced PDF text extraction
      const decoder = new TextDecoder();
      const rawText = decoder.decode(fileBuffer);
      extractedText = extractReadableTextFromPDF(rawText);
      
      // If we couldn't extract meaningful text, try alternative approach
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = extractPDFTextAlternative(rawText);
      }
      
      // Final fallback for PDFs
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = `[PDF Document: ${fileName || 'Unknown'}]\n\nThis PDF document has been uploaded but requires manual text extraction. The document may be image-based or contain complex formatting that requires specialized parsing tools.`;
      }
    } 
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Enhanced DOCX text extraction
      const decoder = new TextDecoder();
      const rawContent = decoder.decode(fileBuffer);
      extractedText = extractTextFromDocx(rawContent);
      
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = `[Word Document: ${fileName || 'Unknown'}]\n\nThis Word document has been uploaded but requires manual text extraction. The document may contain complex formatting or be corrupted.`;
      }
    }
    else if (mimeType === 'application/msword') {
      // DOC files (older format)
      const decoder = new TextDecoder();
      const rawContent = decoder.decode(fileBuffer);
      extractedText = extractTextFromDoc(rawContent);
      
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = `[Word Document: ${fileName || 'Unknown'}]\n\nThis Word document (.doc) has been uploaded but requires manual text extraction. Legacy Word documents require specialized parsing.`;
      }
    }
    else if (mimeType === 'application/rtf' || mimeType === 'text/rtf') {
      // RTF text extraction
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

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `[Document: ${fileName || 'Unknown'}]\n\nThis document was uploaded but no readable text could be extracted. The file may be empty, corrupted, or in a format that requires specialized tools.`;
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

// Enhanced function to extract readable text from PDF content
function extractReadableTextFromPDF(rawContent: string): string {
  try {
    const textBlocks: string[] = [];
    
    // Multiple patterns to extract text from PDFs
    const patterns = [
      /\(([^)]+)\)Tj/g,
      /\[([^\]]+)\]TJ/g,
      /BT\s+([^ET]+)ET/g,
      /\/F\d+\s+\d+\s+Tf\s+([^BT]+)/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(rawContent)) !== null) {
        if (match[1] && match[1].length > 1) {
          const cleanText = match[1]
            .replace(/\\r|\\n/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/[^\x20-\x7E\s]/g, ' ')
            .trim();
          
          if (cleanText.length > 2) {
            textBlocks.push(cleanText);
          }
        }
      }
    }
    
    return textBlocks.join('\n').trim();
  } catch (e) {
    console.error("Error extracting text from PDF:", e);
    return "";
  }
}

// Alternative PDF text extraction method
function extractPDFTextAlternative(rawContent: string): string {
  try {
    // Look for stream objects that might contain text
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/gi;
    const textBlocks: string[] = [];
    
    let match;
    while ((match = streamPattern.exec(rawContent)) !== null) {
      const streamContent = match[1];
      
      // Try to find readable text in the stream
      const readableText = streamContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && /[a-zA-Z]/.test(word))
        .join(' ');
      
      if (readableText.length > 10) {
        textBlocks.push(readableText);
      }
    }
    
    return textBlocks.join('\n').trim();
  } catch (e) {
    console.error("Alternative PDF extraction error:", e);
    return "";
  }
}

// Enhanced function to extract text from DOCX content
function extractTextFromDocx(rawContent: string): string {
  try {
    // DOCX files are ZIP archives with XML documents
    const textBlocks: string[] = [];
    
    // Look for text between <w:t> tags (Word text elements)
    const textPattern = /<w:t[^>]*>(.*?)<\/w:t>/gs;
    const paragraphPattern = /<w:p[^>]*>/g;
    
    let match;
    while ((match = textPattern.exec(rawContent)) !== null) {
      if (match[1]) {
        const text = match[1]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x\w+;/g, ' ')
          .trim();
        
        if (text.length > 0) {
          textBlocks.push(text);
        }
      }
    }
    
    // If no text found, try broader search
    if (textBlocks.length === 0) {
      const broadPattern = />([^<]+)</g;
      while ((match = broadPattern.exec(rawContent)) !== null) {
        const text = match[1].trim();
        if (text.length > 3 && /[a-zA-Z]/.test(text)) {
          textBlocks.push(text);
        }
      }
    }
    
    return textBlocks.join(' ').trim();
  } catch (e) {
    console.error("Error extracting text from DOCX:", e);
    return "";
  }
}

// Function to extract text from DOC files (legacy format)
function extractTextFromDoc(rawContent: string): string {
  try {
    // DOC files have a different structure than DOCX
    // This is a simplified extraction that looks for readable text
    const textBlocks: string[] = [];
    
    // Remove binary data and look for readable text
    const cleanContent = rawContent
      .replace(/[\x00-\x1F\x7F-\xFF]/g, ' ')
      .replace(/\s+/g, ' ');
    
    // Split into words and filter for meaningful content
    const words = cleanContent.split(' ')
      .filter(word => word.length > 2 && /[a-zA-Z]/.test(word))
      .slice(0, 1000); // Limit to prevent memory issues
    
    return words.join(' ').trim();
  } catch (e) {
    console.error("Error extracting text from DOC:", e);
    return "";
  }
}

// Strip RTF formatting to get plain text
function stripRtfFormatting(rtfContent: string): string {
  try {
    // Remove RTF control words and formatting
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
