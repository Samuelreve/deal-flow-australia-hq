import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// 2025 Best Practice: Multiple PDF extraction libraries for better compatibility
import { extractText as extractPdfTextUnpdf } from "npm:unpdf@0.12.0";
// Alternative PDF extraction using pdfjs-dist (Mozilla's PDF.js)
import * as pdfjs from "npm:pdfjs-dist@4.8.69";
// DOCX extraction - industry standard
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
      console.log('📄 Processing PDF with multiple extraction methods (2025 best practice)...');
      
      // Comprehensive PDF validation
      console.log('🔧 PDF buffer validation:', {
        size: fileBuffer.length,
        firstBytes: Array.from(fileBuffer.slice(0, 8)).map(b => b.toString(16)).join(' '),
        isPDF: fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46,
        lastBytes: Array.from(fileBuffer.slice(-8)).map(b => b.toString(16)).join(' ')
      });
      
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
      
      // Method 1: Try unpdf first (optimized for serverless)
      try {
        console.log('🔄 Attempting PDF extraction with unpdf...');
        const extractionResult = await extractPdfTextUnpdf(fileBuffer);
        
        console.log('📋 unpdf extraction result:', {
          hasText: !!extractionResult?.text,
          textLength: extractionResult?.text?.length || 0,
          textPreview: extractionResult?.text?.substring(0, 150) || 'No text'
        });
        
        if (extractionResult?.text && extractionResult.text.trim().length > 10) {
          extractedText = enhancedPdfTextCleaning(extractionResult.text);
          console.log(`✅ unpdf extraction successful: ${extractedText.length} characters`);
        } else {
          throw new Error('unpdf returned empty or insufficient text');
        }
      } catch (unpdfError) {
        console.warn('⚠️ unpdf failed, trying pdfjs-dist fallback:', unpdfError.message);
        
        // Method 2: Fallback to pdfjs-dist
        try {
          console.log('🔄 Attempting PDF extraction with pdfjs-dist...');
          
          // Load PDF document
          const loadingTask = pdfjs.getDocument({ data: fileBuffer });
          const pdfDocument = await loadingTask.promise;
          
          console.log('📋 PDF document loaded:', {
            numPages: pdfDocument.numPages,
            fingerprint: pdfDocument.fingerprint
          });
          
          let fullText = '';
          
          // Extract text from all pages
          for (let pageNum = 1; pageNum <= Math.min(pdfDocument.numPages, 50); pageNum++) { // Limit to 50 pages for performance
            try {
              const page = await pdfDocument.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .filter(item => 'str' in item)
                .map(item => (item as any).str)
                .join(' ');
              
              if (pageText.trim()) {
                fullText += pageText + '\n';
              }
            } catch (pageError) {
              console.warn(`⚠️ Failed to extract text from page ${pageNum}:`, pageError.message);
            }
          }
          
          if (fullText.trim().length > 10) {
            extractedText = enhancedPdfTextCleaning(fullText);
            console.log(`✅ pdfjs-dist extraction successful: ${extractedText.length} characters`);
          } else {
            throw new Error('pdfjs-dist returned empty or insufficient text');
          }
        } catch (pdfjsError) {
          console.error('❌ All PDF extraction methods failed:', {
            unpdf: unpdfError.message,
            pdfjs: pdfjsError.message
          });
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `PDF text extraction failed with all methods. This may be a scanned PDF, encrypted, password-protected, or contain only images. Errors: unpdf(${unpdfError.message}), pdfjs(${pdfjsError.message})` 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('📄 Processing DOCX with enhanced mammoth configuration...');
      
      // DOCX file validation
      console.log('🔧 DOCX buffer validation:', {
        size: fileBuffer.length,
        firstBytes: Array.from(fileBuffer.slice(0, 8)).map(b => b.toString(16)).join(' '),
        isZip: fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B,
        hasZipSignature: fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04
      });
      
      // Verify ZIP/DOCX magic number
      if (!(fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'File does not appear to be a valid DOCX (missing ZIP header)' 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // Enhanced mammoth configuration for better text extraction
        const extractionOptions = {
          buffer: fileBuffer,
          // Ignore styles that don't affect text content
          ignoreEmptyParagraphs: false,
          // Convert images to alt text if available
          convertImage: mammoth.images.imgElement(function(image) {
            return image.read("base64").then(function(imageBuffer) {
              return {
                src: "data:" + image.contentType + ";base64," + imageBuffer,
                alt: "Image content" // Provide fallback alt text
              };
            }).catch(function() {
              return { alt: "[Image]" }; // Fallback for failed image processing
            });
          }),
          // Enhanced style mapping to preserve important formatting
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em"
          ]
        };
        
        console.log('🔄 Extracting DOCX text with enhanced configuration...');
        const result = await mammoth.extractRawText(extractionOptions);
        
        extractedText = result.value || '';
        
        console.log('📋 DOCX extraction result:', {
          textLength: extractedText.length,
          hasMessages: result.messages && result.messages.length > 0,
          messageCount: result.messages?.length || 0,
          textPreview: extractedText.substring(0, 150) || 'No text',
          warningCount: result.messages?.filter(m => m.type === 'warning').length || 0,
          errorCount: result.messages?.filter(m => m.type === 'error').length || 0
        });
        
        // Log detailed messages for debugging
        if (result.messages && result.messages.length > 0) {
          const warnings = result.messages.filter(m => m.type === 'warning');
          const errors = result.messages.filter(m => m.type === 'error');
          
          if (warnings.length > 0) {
            console.log('⚠️ Mammoth warnings:', warnings.map(m => m.message));
          }
          if (errors.length > 0) {
            console.log('❌ Mammoth errors:', errors.map(m => m.message));
          }
        }
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text content found in DOCX file - may be empty or contain only images/tables');
        }
        
        // Enhanced text cleaning for DOCX
        extractedText = enhancedDocxTextCleaning(extractedText);
        console.log(`✅ DOCX extraction successful: ${extractedText.length} characters after cleaning`);
        
        if (extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text after cleaning - DOCX may contain mostly images, tables, or complex formatting');
        }
      } catch (error) {
        console.error('❌ DOCX extraction failed with detailed error:', {
          error: error.message,
          stack: error.stack,
          bufferSize: fileBuffer.length
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `DOCX text extraction failed: ${error.message}. File may be corrupted, password-protected, or contain only non-text content.` 
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

    // Final validation and quality checks
    if (!extractedText || extractedText.trim().length === 0) {
      console.error('❌ Final validation failed: No text extracted');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No readable text could be extracted from the document. The file may be empty, corrupted, or contain only images/graphics.' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Quality check: ensure we have meaningful content
    const trimmedText = extractedText.trim();
    if (trimmedText.length < 5) {
      console.error('❌ Quality check failed: Insufficient text content', {
        extractedLength: extractedText.length,
        trimmedLength: trimmedText.length
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Insufficient text content extracted (${trimmedText.length} characters). The document may contain primarily images, graphics, or formatting.`
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎉 Text extraction completed successfully!`);
    console.log('📊 Final extraction stats:', {
      originalLength: extractedText.length,
      trimmedLength: trimmedText.length,
      fileName: fileName || 'Unknown',
      mimeType: mimeType
    });
    console.log('📋 Text preview:', trimmedText.substring(0, 200) + (trimmedText.length > 200 ? '...' : ''));

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        extractedLength: extractedText.length,
        fileName: fileName || 'document',
        mimeType: mimeType,
        quality: {
          hasContent: trimmedText.length > 5,
          wordCount: trimmedText.split(/\s+/).length,
          avgWordLength: trimmedText.split(/\s+/).reduce((acc, word) => acc + word.length, 0) / trimmedText.split(/\s+/).length
        }
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