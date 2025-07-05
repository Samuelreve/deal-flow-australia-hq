import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Use unpdf for better PDF extraction in serverless environments - 2025 best practice
import { extractText as extractPdfText } from "npm:unpdf@0.12.0";
// Use mammoth for DOCX extraction - industry standard
import mammoth from "npm:mammoth@1.8.0";

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

    // Convert base64 to proper buffer with enhanced decoding
    let fileBuffer: Uint8Array;
    try {
      // Decode base64 more robustly
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
    
    // Extract text based on file type
    if (mimeType === 'text/plain') {
      console.log('📄 Processing plain text file...');
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(fileBuffer);
      console.log(`✅ Plain text extraction: ${extractedText.length} characters`);
    }
    else if (mimeType === 'application/pdf') {
      console.log('📄 Processing PDF with unpdf (2025 best practice)...');
      try {
        console.log('🔧 PDF buffer details:', {
          size: fileBuffer.length,
          firstBytes: Array.from(fileBuffer.slice(0, 8)).map(b => b.toString(16)).join(' '),
          isPDF: fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46
        });
        
        // Verify it's actually a PDF file
        if (!(fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46)) {
          throw new Error('File does not appear to be a valid PDF (missing PDF header)');
        }
        
        // Use unpdf with enhanced error handling
        const extractionResult = await extractPdfText(fileBuffer);
        console.log('📋 PDF extraction result:', {
          hasText: !!extractionResult?.text,
          textLength: extractionResult?.text?.length || 0,
          textPreview: extractionResult?.text?.substring(0, 100) || 'No text'
        });
        
        extractedText = extractionResult?.text || '';
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text content found in PDF - may be image-based or encrypted');
        }
        
        // Enhanced text cleaning for PDFs
        extractedText = enhancedPdfTextCleaning(extractedText);
        console.log(`✅ PDF extraction successful: ${extractedText.length} characters after cleaning`);
        
        if (extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text after cleaning - PDF may contain mostly images or formatting');
        }
      } catch (error) {
        console.error('❌ PDF extraction failed:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `PDF text extraction failed: ${error.message}. This may be a scanned PDF, encrypted, or contain only images.` 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('📄 Processing DOCX with mammoth (industry standard)...');
      try {
        console.log('🔧 DOCX buffer details:', {
          size: fileBuffer.length,
          firstBytes: Array.from(fileBuffer.slice(0, 8)).map(b => b.toString(16)).join(' '),
          isZip: fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B
        });
        
        // Verify it's actually a DOCX/ZIP file
        if (!(fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B)) {
          throw new Error('File does not appear to be a valid DOCX (missing ZIP header)');
        }
        
        // Use mammoth with enhanced options
        const result = await mammoth.extractRawText({ 
          buffer: fileBuffer,
          // Add options for better text extraction
          convertImage: mammoth.images.imgElement(function(image) {
            return image.read("base64").then(function(imageBuffer) {
              return {
                src: "data:" + image.contentType + ";base64," + imageBuffer
              };
            });
          })
        });
        
        extractedText = result.value || '';
        console.log('📋 DOCX extraction result:', {
          textLength: extractedText.length,
          hasMessages: result.messages && result.messages.length > 0,
          messageCount: result.messages?.length || 0,
          textPreview: extractedText.substring(0, 100) || 'No text'
        });
        
        if (result.messages && result.messages.length > 0) {
          console.log('📝 Mammoth messages:', result.messages.map(m => ({
            type: m.type,
            message: m.message
          })));
        }
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text content found in DOCX file');
        }
        
        // Enhanced text cleaning for DOCX
        extractedText = enhancedDocxTextCleaning(extractedText);
        console.log(`✅ DOCX extraction successful: ${extractedText.length} characters after cleaning`);
        
        if (extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text after cleaning - DOCX may contain mostly images or formatting');
        }
      } catch (error) {
        console.error('❌ DOCX extraction failed:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `DOCX text extraction failed: ${error.message}. File may be corrupted or password-protected.` 
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
 * Enhanced PDF text cleaning - 2025 best practices
 */
function enhancedPdfTextCleaning(text: string): string {
  if (!text) return '';
  
  return text
    // Remove PDF-specific artifacts
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    .replace(/[^\x20-\x7E\s\n\r\t]/g, ' ') // Non-printable characters except common whitespace
    // Fix common PDF text extraction issues
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Fix missing spaces between words
    .replace(/(\w)(\d)/g, '$1 $2') // Space between letters and numbers
    .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Space between numbers and letters
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t+/g, ' ')
    .trim();
}

/**
 * Enhanced DOCX text cleaning - 2025 best practices
 */
function enhancedDocxTextCleaning(text: string): string {
  if (!text) return '';
  
  return text
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Clean up DOCX-specific formatting artifacts
    .replace(/\r\n/g, '\n') // Normalize line breaks
    .replace(/\r/g, '\n')
    // Remove excessive whitespace while preserving paragraph structure
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '') // Trim each line
    .trim();
}

/**
 * Basic text cleaning fallback
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