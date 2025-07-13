import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// 2025 Best Practice: Reliable Deno-compatible libraries  
// Use JSZip for DOCX extraction (reliable in Deno)
import JSZip from "https://esm.sh/jszip@3.10.1?target=deno";

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
      console.log('📄 Processing PDF with OCR directly (skipping regular extraction)...');
      
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
        console.log('🔄 Using OCR only for PDF text extraction...');
        
        // Use pdf2pic for PDF to image conversion, then OCR
        const { pdf2pic } = await import("https://esm.sh/pdf2pic@3.1.1");
        const { recognize } = await import("https://esm.sh/tesseract.js@5.0.4");
        
        console.log('🔄 Converting PDF to images for OCR...');
        
        // Convert PDF to images (first 3 pages only to avoid timeout)
        const convert = pdf2pic.fromBuffer(fileBuffer, {
          density: 200,           // Higher DPI for better OCR
          saveFilename: "page",
          savePath: "/tmp",
          format: "png",
          width: 2000,           // Higher resolution for better OCR
          height: 2800
        });
        
        let ocrText = '';
        const maxPages = 3; // Limit to first 3 pages to avoid timeout
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          try {
            console.log(`🔄 Converting PDF page ${pageNum} to image...`);
            const pageResult = await convert(pageNum, { responseType: "buffer" });
            
            if (pageResult?.buffer) {
              console.log(`📄 Running OCR on page ${pageNum}...`);
              const ocrResult = await recognize(pageResult.buffer, 'eng', {
                logger: m => {
                  if (m.status && m.progress !== undefined) {
                    console.log(`OCR Page ${pageNum}: ${m.status} ${Math.round(m.progress * 100)}%`);
                  }
                },
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:\'"()-[]{}/@#$%^&*+=|\\~`<>',
                tessedit_pageseg_mode: '1',
                tessedit_ocr_engine_mode: '1'
              });
              
              const pageText = ocrResult.data.text.trim();
              if (pageText.length > 20) {
                ocrText += pageText + '\n\n';
                console.log(`✅ OCR extracted ${pageText.length} characters from page ${pageNum}`);
              }
            }
          } catch (pageError) {
            console.error(`❌ OCR failed for page ${pageNum}:`, pageError);
            // Continue with next page
            continue;
          }
        }
        
        if (ocrText.trim().length > 20) {
          extractedText = ocrText.trim();
          console.log(`✅ OCR extraction successful: ${extractedText.length} characters from ${maxPages} pages`);
          extractedText = enhancedPdfTextCleaning(extractedText);
        } else {
          throw new Error('OCR extraction yielded insufficient text');
        }
        
      } catch (ocrError) {
        console.error('❌ OCR extraction failed:', ocrError);
        
        // Fallback: raw text extraction only if OCR completely fails
        try {
          console.log('🔄 Trying final fallback text extraction...');
          const fallbackText = new TextDecoder('utf-8', { ignoreBOM: true }).decode(fileBuffer);
          const textMatches = fallbackText.match(/[a-zA-Z][a-zA-Z\s,.!?;:'"()-]{20,}/g);
          
          if (textMatches && textMatches.length > 0) {
            extractedText = textMatches.join(' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
            console.log('✅ Final fallback extraction successful');
          } else {
            throw new Error('No readable text found');
          }
          
        } catch (finalError) {
          console.error('❌ All extraction methods failed:', finalError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Unable to extract text from PDF using OCR. The file may be encrypted, corrupted, or contain only images without readable text.' 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('📄 Processing DOCX with JSZip...');
      
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
        console.log('🔄 Attempting DOCX extraction with JSZip...');
        
        // Extract DOCX using JSZip and XML parsing
        const zip = new JSZip();
        const zipFile = await zip.loadAsync(fileBuffer);
        
        console.log('📋 DOCX ZIP contents:', Object.keys(zipFile.files));
        
        // Get the main document content
        const documentXml = zipFile.files['word/document.xml'];
        if (!documentXml) {
          throw new Error('Invalid DOCX file: missing word/document.xml');
        }
        
        const xmlContent = await documentXml.async('text');
        console.log('📋 XML content length:', xmlContent.length);
        
        // Extract text from XML using regex (basic but reliable)
        extractedText = extractTextFromDocxXml(xmlContent);
        
        console.log('📋 DOCX extraction result:', {
          textLength: extractedText.length,
          textPreview: extractedText.substring(0, 200) || 'No text'
        });
        
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
        console.error('❌ DOCX extraction failed:', {
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
        console.log('🔄 Attempting RTF extraction...');
        
        // Try multiple decoders for RTF
        let rtfContent = '';
        
        // Method 1: Try UTF-8 first
        try {
          const decoder = new TextDecoder('utf-8');
          rtfContent = decoder.decode(fileBuffer);
          console.log('✅ RTF decoded with UTF-8');
        } catch (utf8Error) {
          console.warn('⚠️ UTF-8 decoding failed, trying Windows-1252:', utf8Error.message);
          
          // Method 2: Try Windows-1252 for legacy RTF files
          try {
            const decoder = new TextDecoder('windows-1252');
            rtfContent = decoder.decode(fileBuffer);
            console.log('✅ RTF decoded with Windows-1252');
          } catch (cp1252Error) {
            console.warn('⚠️ Windows-1252 decoding failed, using UTF-8 with replacement:', cp1252Error.message);
            
            // Method 3: Fallback to UTF-8 with replacement
            const decoder = new TextDecoder('utf-8', { fatal: false });
            rtfContent = decoder.decode(fileBuffer);
            console.log('✅ RTF decoded with UTF-8 (replacement mode)');
          }
        }
        
        console.log('📋 RTF content info:', {
          length: rtfContent.length,
          hasRtfHeader: rtfContent.startsWith('{\\rtf'),
          preview: rtfContent.substring(0, 100)
        });
        
        if (!rtfContent.startsWith('{\\rtf')) {
          throw new Error('File does not appear to be a valid RTF document (missing RTF header)');
        }
        
        extractedText = extractRtfText(rtfContent);
        
        console.log(`✅ RTF extraction completed: ${extractedText.length} characters`);
        
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error('Insufficient readable text extracted from RTF');
        }
      } catch (error) {
        console.error('❌ RTF extraction failed:', {
          error: error.message,
          bufferSize: fileBuffer.length,
          firstBytes: Array.from(fileBuffer.slice(0, 20)).map(b => String.fromCharCode(b)).join('')
        });
        
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
    console.log('📋 Text preview:', trimmedText.substring(0, 300) + (trimmedText.length > 300 ? '...' : ''));

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
    .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']', 'g'), '') // Control characters
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
    .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']', 'g'), '')
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
    .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']', 'g'), '')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
}

/**
 * Extract text from RTF content using advanced parsing
 */
function extractRtfText(rtfContent: string): string {
  try {
    console.log('🔧 Starting advanced RTF parsing...');
    
    if (!rtfContent || !rtfContent.trim()) {
      throw new Error('Empty RTF content');
    }
    
    let result = '';
    let i = 0;
    const len = rtfContent.length;
    
    console.log('📋 RTF content info:', {
      length: len,
      hasRtfHeader: rtfContent.substring(0, 100).includes('\\rtf'),
      startsWithBrace: rtfContent.trim().startsWith('{')
    });
    
    // Advanced RTF parser that handles nested groups and control words properly
    while (i < len) {
      const char = rtfContent[i];
      
      if (char === '{') {
        // Start of group - find matching closing brace
        const groupContent = extractRtfGroup(rtfContent, i);
        i = groupContent.endIndex;
        
        // Check if this group contains actual text content
        const groupText = parseRtfGroup(groupContent.content);
        if (groupText && groupText.trim()) {
          result += groupText + ' ';
        }
      } else if (char === '\\') {
        // Control word or symbol
        const controlInfo = parseRtfControl(rtfContent, i);
        i = controlInfo.endIndex;
        
        // Handle special control words that contain text
        if (controlInfo.isText) {
          result += controlInfo.text;
        } else if (controlInfo.isLineBreak) {
          result += '\n';
        } else if (controlInfo.isSpace) {
          result += ' ';
        }
      } else if (char === '}') {
        // End of group - skip
        i++;
      } else {
        // Regular text character
        if (char.charCodeAt(0) >= 32 || char === '\n' || char === '\r' || char === '\t') {
          result += char;
        }
        i++;
      }
    }
    
         // Clean up the extracted text
     const cleanedText = result
      // Handle Unicode escapes
      .replace(/\\u(\d+)\?/g, (match, code) => {
        try {
          return String.fromCharCode(parseInt(code));
        } catch {
          return '';
        }
      })
      // Handle Unicode escapes without replacement char
      .replace(/\\u(\d+)/g, (match, code) => {
        try {
          return String.fromCharCode(parseInt(code));
        } catch {
          return '';
        }
      })
      // Clean up line breaks and spacing
      .replace(/\\par\b/g, '\n')
      .replace(/\\line\b/g, '\n')
      .replace(/\\tab\b/g, '\t')
      // Remove any remaining control words
      .replace(/\\[a-zA-Z]+\d*\s?/g, ' ')
      .replace(/\\[^a-zA-Z\s]/g, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    console.log('📋 RTF parsing result:', {
      originalLength: rtfContent.length,
      extractedLength: cleanedText.length,
      textPreview: cleanedText.substring(0, 200)
    });
    
    if (!cleanedText || cleanedText.length < 5) {
      throw new Error('Insufficient text extracted from RTF');
    }
    
    return cleanedText;
    
  } catch (error) {
    console.error('❌ Error in advanced RTF parsing:', error);
    
    // Enhanced fallback parser
    console.log('🔄 Using enhanced fallback RTF parser...');
    
    try {
      let fallbackText = rtfContent;
      
      // Step 1: Remove known RTF control groups
      fallbackText = fallbackText
        // Remove RTF header info
        .replace(/^\{\\rtf\d+[^{}]*/, '')
        // Remove font table
        .replace(/\{\\fonttbl[^{}]*(\{[^{}]*\})*[^{}]*\}/g, '')
        // Remove color table  
        .replace(/\{\\colortbl[^{}]*(\{[^{}]*\})*[^{}]*\}/g, '')
        // Remove style table
        .replace(/\{\\stylesheet[^{}]*(\{[^{}]*\})*[^{}]*\}/g, '')
        // Remove info table
        .replace(/\{\\info[^{}]*(\{[^{}]*\})*[^{}]*\}/g, '')
        // Remove generator info
        .replace(/\{\\generator[^{}]*\}/g, '')
        // Remove page setup
        .replace(/\\paperw\d+\\paperh\d+[^{}]*/g, '')
        // Remove margins
        .replace(/\\margl\d+\\margr\d+\\margt\d+\\margb\d+/g, '');
      
      // Step 2: Handle Unicode characters
      fallbackText = fallbackText
        .replace(/\\u(\d+)\?/g, (match, code) => {
          try {
            const charCode = parseInt(code);
            return charCode > 0 && charCode < 65536 ? String.fromCharCode(charCode) : '';
          } catch {
            return '';
          }
        });
      
      // Step 3: Handle special RTF commands
      fallbackText = fallbackText
        .replace(/\\par\b/g, '\n')
        .replace(/\\line\b/g, '\n') 
        .replace(/\\tab\b/g, '\t')
        .replace(/\\~\b/g, ' ') // Non-breaking space
        .replace(/\\-\b/g, '') // Optional hyphen
        .replace(/\\_\b/g, '') // Non-breaking hyphen;
      
      // Step 4: Remove all remaining control words and symbols
      fallbackText = fallbackText
        .replace(/\\[a-zA-Z]+\d*\s?/g, ' ') // Control words with optional parameters
        .replace(/\\[^a-zA-Z\s]/g, '') // Control symbols
        .replace(/[{}]/g, '') // Remove all braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log('✅ Fallback RTF parsing completed:', {
        fallbackLength: fallbackText.length,
        textPreview: fallbackText.substring(0, 200)
      });
      
      if (!fallbackText || fallbackText.length < 5) {
        throw new Error('Fallback RTF parser also failed to extract sufficient text');
      }
      
      return fallbackText;
      
    } catch (fallbackError) {
      console.error('❌ Fallback RTF parser also failed:', fallbackError);
      throw new Error(`RTF parsing failed: ${error.message}`);
    }
  }
}

/**
 * Extract RTF group content and find matching closing brace
 */
function extractRtfGroup(content: string, startIndex: number): { content: string; endIndex: number } {
  let braceLevel = 0;
  let i = startIndex;
  const start = i;
  
  while (i < content.length) {
    const char = content[i];
    if (char === '{') {
      braceLevel++;
    } else if (char === '}') {
      braceLevel--;
      if (braceLevel === 0) {
        return {
          content: content.substring(start + 1, i), // Exclude the braces
          endIndex: i + 1
        };
      }
    } else if (char === '\\' && i + 1 < content.length) {
      // Skip escaped characters
      i++;
    }
    i++;
  }
  
  // If we reach here, braces weren't properly closed
  return {
    content: content.substring(start + 1),
    endIndex: content.length
  };
}

/**
 * Parse RTF group content to extract readable text
 */
function parseRtfGroup(groupContent: string): string {
  // Skip known non-text groups
  if (groupContent.match(/^\\(fonttbl|colortbl|stylesheet|info|generator|field)/)) {
    return '';
  }
  
  // Extract text while handling control words
  let result = '';
  let i = 0;
  
  while (i < groupContent.length) {
    const char = groupContent[i];
    
    if (char === '\\') {
      const controlInfo = parseRtfControl(groupContent, i);
      i = controlInfo.endIndex;
      
      if (controlInfo.isText) {
        result += controlInfo.text;
      } else if (controlInfo.isLineBreak) {
        result += '\n';
      } else if (controlInfo.isSpace) {
        result += ' ';
      }
    } else if (char === '{') {
      // Nested group
      const nestedGroup = extractRtfGroup(groupContent, i);
      i = nestedGroup.endIndex;
      const nestedText = parseRtfGroup(nestedGroup.content);
      if (nestedText) {
        result += nestedText;
      }
    } else {
      // Regular character
      if (char.charCodeAt(0) >= 32 || char === '\n' || char === '\r' || char === '\t') {
        result += char;
      }
      i++;
    }
  }
  
  return result;
}

/**
 * Extract text from DOCX XML content using regex parsing
 */
function extractTextFromDocxXml(xmlContent: string): string {
  try {
    // Remove XML tags and extract text content
    let text = xmlContent
      // Extract text from <w:t> tags (text runs)
      .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1')
      // Extract text from <w:t> self-closing tags with content
      .replace(/<w:t[^>]*>([^<]*)/g, '$1')
      // Add spaces for paragraph breaks
      .replace(/<\/w:p>/g, '\n')
      // Add spaces for line breaks
      .replace(/<w:br[^>]*>/g, '\n')
      // Add tabs for tab characters
      .replace(/<w:tab[^>]*>/g, '\t')
      // Remove all remaining XML tags
      .replace(/<[^>]*>/g, '')
      // Decode XML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
    
    return text;
  } catch (error) {
    console.error('Error parsing DOCX XML:', error);
    throw new Error(`Failed to parse DOCX XML: ${error.message}`);
  }
}

/**
 * Parse RTF control word or symbol
 */
function parseRtfControl(content: string, startIndex: number): { 
  endIndex: number; 
  isText: boolean; 
  isLineBreak: boolean; 
  isSpace: boolean; 
  text: string 
} {
  let i = startIndex + 1; // Skip the backslash
  
  if (i >= content.length) {
    return { endIndex: i, isText: false, isLineBreak: false, isSpace: false, text: '' };
  }
  
  const char = content[i];
  
  // Handle control symbols (non-alphabetic)
  if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
    if (char === '\n' || char === '\r') {
      return { endIndex: i + 1, isText: false, isLineBreak: true, isSpace: false, text: '' };
    } else if (char === ' ') {
      return { endIndex: i + 1, isText: false, isLineBreak: false, isSpace: true, text: '' };
    } else if (char === '\\') {
      return { endIndex: i + 1, isText: true, isLineBreak: false, isSpace: false, text: '\\' };
    } else if (char === '{') {
      return { endIndex: i + 1, isText: true, isLineBreak: false, isSpace: false, text: '{' };
    } else if (char === '}') {
      return { endIndex: i + 1, isText: true, isLineBreak: false, isSpace: false, text: '}' };
    }
    return { endIndex: i + 1, isText: false, isLineBreak: false, isSpace: false, text: '' };
  }
  
  // Handle control words (alphabetic)
  while (i < content.length && ((content[i] >= 'a' && content[i] <= 'z') || (content[i] >= 'A' && content[i] <= 'Z'))) {
    i++;
  }
  
  // Handle optional numeric parameter
  while (i < content.length && content[i] >= '0' && content[i] <= '9') {
    i++;
  }
  
  // Handle optional space delimiter
  if (i < content.length && content[i] === ' ') {
    i++;
  }
  
  const controlWord = content.substring(startIndex, i);
  
  // Check for control words that should produce text or formatting
  if (controlWord.match(/^\\(par|line)(\d+)?\s?$/)) {
    return { endIndex: i, isText: false, isLineBreak: true, isSpace: false, text: '' };
  } else if (controlWord.match(/^\\(tab)(\d+)?\s?$/)) {
    return { endIndex: i, isText: true, isLineBreak: false, isSpace: false, text: '\t' };
  }
  
  return { endIndex: i, isText: false, isLineBreak: false, isSpace: false, text: '' };
}