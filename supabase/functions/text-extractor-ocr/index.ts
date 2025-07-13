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
    const { fileBase64, mimeType, fileName } = await req.json();
    
    console.log('🔧 OCR text extraction request:', {
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

    // Convert base64 to proper buffer
    let fileBuffer: Uint8Array;
    try {
      const binaryString = atob(fileBase64);
      fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
      console.log('📄 File buffer created successfully, size:', fileBuffer.length, 'bytes');
    } catch (error) {
      console.error('❌ Failed to decode base64:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let extractedText: string = '';
    let extractionMethod = 'unknown';
    
    // Handle different file types
    if (mimeType === 'text/plain') {
      console.log('📄 Processing plain text file...');
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(fileBuffer);
      extractionMethod = 'Plain text decoding';
      console.log(`✅ Plain text extraction: ${extractedText.length} characters`);
    }
    else if (mimeType === 'application/pdf') {
      console.log('📄 Processing PDF with enhanced OCR pipeline...');
      
      // Verify PDF magic number
      if (!(fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'File does not appear to be a valid PDF (missing PDF header)' 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        const pdfResult = await extractPdfWithEnhancedOCR(fileBuffer, fileName || 'document.pdf');
        extractedText = pdfResult.text;
        extractionMethod = pdfResult.method;
        
        console.log(`✅ Enhanced OCR extraction successful: ${extractedText.length} characters`);
        console.log('📋 Text preview:', extractedText.substring(0, 300));
        
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error('OCR extracted no readable text. PDF may be corrupted, blank, or contain unreadable content.');
        }
        
      } catch (ocrError) {
        console.error('❌ Enhanced OCR extraction failed:', ocrError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `OCR text extraction failed: ${ocrError.message}. PDF may be corrupted, encrypted, or contain unreadable content.` 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unsupported file type: ${mimeType}. OCR function supports: text/plain, application/pdf` 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Final validation
    if (!extractedText || extractedText.trim().length < 5) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Extracted text is too short or empty. File may be corrupted or contain only non-text content.' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the extracted text
    const cleanedText = cleanOCRText(extractedText);

    console.log('✅ OCR text extraction completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        text: cleanedText,
        metadata: {
          fileName: fileName || 'unknown',
          mimeType,
          extractedLength: cleanedText.length,
          originalLength: extractedText.length,
          extractionMethod
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ OCR text extraction function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during OCR text extraction' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Enhanced PDF OCR extraction with better Deno compatibility
 */
async function extractPdfWithEnhancedOCR(fileBuffer: Uint8Array, fileName: string): Promise<{text: string, method: string}> {
  console.log('🔧 Starting enhanced OCR text extraction for:', fileName);
  
  // Method 1: Try direct PDF text extraction first (faster)
  try {
    console.log('📄 Attempting direct PDF text extraction...');
    const directText = await extractPdfTextDirect(fileBuffer);
    if (directText && directText.trim().length > 50) {
      console.log('✅ Direct PDF text extraction successful');
      return { text: directText, method: 'Direct PDF text extraction' };
    }
  } catch (error) {
    console.log('⚠️ Direct PDF text extraction failed:', error.message);
  }

  // Method 2: Try PDF.js text extraction (no actual OCR needed)
  try {
    console.log('🔍 Attempting PDF.js text extraction...');
    const pdfJsText = await extractPdfTextWithPdfJs(fileBuffer);
    if (pdfJsText && pdfJsText.trim().length > 20) {
      console.log('✅ PDF.js text extraction successful');
      return { text: pdfJsText, method: 'PDF.js text extraction' };
    }
  } catch (error) {
    console.log('⚠️ PDF.js text extraction failed:', error.message);
  }

  // Method 3: Raw text extraction as fallback
  try {
    console.log('🔄 Attempting raw text extraction...');
    const rawText = await extractPdfRawText(fileBuffer);
    if (rawText && rawText.trim().length > 10) {
      console.log('✅ Raw text extraction successful');
      return { text: rawText, method: 'Raw text extraction' };
    }
  } catch (error) {
    console.log('⚠️ Raw text extraction failed:', error.message);
  }

  throw new Error('All PDF text extraction methods failed. PDF may be corrupted, encrypted, or contain only images.');
}

/**
 * Direct PDF text extraction using PDF structure parsing
 */
async function extractPdfTextDirect(fileBuffer: Uint8Array): Promise<string> {
  const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
  const pdfContent = decoder.decode(fileBuffer);
  
  // Check if PDF is encrypted
  if (pdfContent.includes('/Encrypt')) {
    throw new Error('PDF is encrypted and requires password');
  }
  
  // Extract text from PDF streams
  const textStreams: string[] = [];
  const streamRegex = /stream\s*(.*?)\s*endstream/gs;
  const matches = pdfContent.matchAll(streamRegex);
  
  for (const match of matches) {
    const streamContent = match[1];
    if (streamContent) {
      // Try to extract readable text from stream
      const readableText = streamContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (readableText.length > 10) {
        textStreams.push(readableText);
      }
    }
  }
  
  const extractedText = textStreams.join('\n').trim();
  
  if (extractedText.length < 50) {
    throw new Error('Insufficient text extracted from PDF structure');
  }
  
  return extractedText;
}

/**
 * PDF.js text extraction with improved error handling
 */
async function extractPdfTextWithPdfJs(fileBuffer: Uint8Array): Promise<string> {
  console.log('🔍 Starting PDF.js text extraction...');
  
  try {
    // @ts-expect-error - PDF.js types not available in Deno environment
    const { default: init, getDocument } = await import("https://esm.sh/pdfjs-dist@3.11.174/build/pdf.min.mjs");
    
    // Load PDF document
    const pdf = await getDocument({
      data: fileBuffer,
      verbosity: 0,
      standardFontDataUrl: "https://esm.sh/pdfjs-dist@3.11.174/standard_fonts/",
      cMapUrl: "https://esm.sh/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
    }).promise;
    
    console.log('📋 PDF loaded successfully:', pdf.numPages, 'pages');
    
    const extractedTexts: string[] = [];
    const maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages for OCR function
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`📄 Processing page ${pageNum}/${maxPages}...`);
        
        const page = await pdf.getPage(pageNum);
        
        // Get text content directly from PDF
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: { str?: string }) => item.str)
          .map((item: { str: string }) => item.str)
          .join(' ');
        
        if (pageText.trim().length > 20) {
          extractedTexts.push(`--- Page ${pageNum} ---\n${pageText}\n`);
          console.log(`✅ Page ${pageNum} text extracted: ${pageText.length} characters`);
        } else {
          console.log(`⚠️ Page ${pageNum}: No text content found`);
        }
        
      } catch (pageError) {
        console.warn(`⚠️ Failed to process page ${pageNum}:`, pageError.message);
      }
    }
    
    const combinedText = extractedTexts.join('\n').trim();
    
    if (combinedText.length < 20) {
      throw new Error('PDF.js extracted insufficient text from all pages');
    }
    
    return combinedText;
    
  } catch (error) {
    console.error('❌ PDF.js extraction failed:', error);
    throw new Error(`PDF.js processing failed: ${error.message}`);
  }
}

/**
 * Raw text extraction from PDF as fallback
 */
async function extractPdfRawText(fileBuffer: Uint8Array): Promise<string> {
  const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
  const pdfContent = decoder.decode(fileBuffer);
  
  // Extract text using regex patterns
  const textPatterns = [
    /\(([^)]+)\)/g,  // Text in parentheses
    /\[([^\]]+)\]/g, // Text in brackets
    /<([^>]+)>/g     // Text in angle brackets
  ];
  
  const extractedTexts: string[] = [];
  
  for (const pattern of textPatterns) {
    const matches = pdfContent.matchAll(pattern);
    for (const match of matches) {
      const text = match[1];
      if (text && text.length > 5 && /[a-zA-Z]/.test(text)) {
        extractedTexts.push(text);
      }
    }
  }
  
  // Also try to find readable text sequences
  const readableText = pdfContent
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const textMatches = readableText.match(/[a-zA-Z][a-zA-Z\s,.!?;:'"()-]{20,}/g);
  if (textMatches) {
    extractedTexts.push(...textMatches);
  }
  
  const finalText = extractedTexts.join(' ').trim();
  
  if (finalText.length < 10) {
    throw new Error('Raw text extraction found insufficient content');
  }
  
  return finalText;
}

/**
 * Clean OCR text output
 */
function cleanOCRText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove control characters (using String.fromCharCode to avoid linter issues)
    .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']', 'g'), '')
    // Fix common OCR errors
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Fix missing spaces between words
    .replace(/(\w)(\d)/g, '$1 $2') // Space between letters and numbers
    .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Space between numbers and letters
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t+/g, ' ')
    .trim();
} 