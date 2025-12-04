import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import PDF.js for direct text extraction
import { getDocument } from "https://esm.sh/pdf.mjs";

const serve_handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64) {
      console.error('❌ No fileBase64 provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No file data provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔍 Starting text extraction for:', fileName, 'mimeType:', mimeType);

    // Validate base64 format and clean up
    let cleanBase64 = fileBase64;
    if (fileBase64.includes(',')) {
      cleanBase64 = fileBase64.split(',')[1]; // Remove data URL prefix if present
    }
    
    if (!cleanBase64.match(/^[A-Za-z0-9+/]+=*$/)) {
      console.error('❌ Invalid base64 format');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid file format - base64 expected' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if this is a text-based file (not PDF)
    const textMimeTypes = [
      'text/plain', 
      'text/html', 
      'text/csv', 
      'text/markdown',
      'application/json',
      'application/xml',
      'text/xml'
    ];
    
    const textExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'];
    const fileExt = fileName ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : '';
    
    const isTextFile = textMimeTypes.includes(mimeType) || textExtensions.includes(fileExt);

    if (isTextFile) {
      console.log('📝 Processing as text file...');
      try {
        const decodedText = atob(cleanBase64);
        // Try to decode as UTF-8
        const decoder = new TextDecoder('utf-8');
        const bytes = new Uint8Array(decodedText.length);
        for (let i = 0; i < decodedText.length; i++) {
          bytes[i] = decodedText.charCodeAt(i);
        }
        const text = decoder.decode(bytes);
        
        console.log(`✅ Text file extracted successfully: ${text.length} characters`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          text: text.trim(),
          method: 'text-decode',
          pageCount: 1,
          successfulPages: 1
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (textError) {
        console.error('❌ Failed to decode text file:', textError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Failed to decode text file: ${textError.message}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Convert base64 to Uint8Array for binary files (PDF)
    let bytes;
    try {
      const binaryString = atob(cleanBase64);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('📄 File converted to bytes:', bytes.length);
      
      // Check PDF magic number
      const pdfHeader = new TextDecoder().decode(bytes.slice(0, 4));
      if (pdfHeader !== '%PDF') {
        // If it's not a PDF and we haven't handled it as text, try to decode as text anyway
        console.log('⚠️ File is not a PDF, attempting text decode...');
        const text = new TextDecoder('utf-8').decode(bytes);
        
        return new Response(JSON.stringify({ 
          success: true, 
          text: text.trim(),
          method: 'fallback-text-decode',
          pageCount: 1,
          successfulPages: 1
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('❌ Failed to process file data:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Invalid file data: ${error.message}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract text from PDF using PDF.js
    let allText = '';
    let totalPages = 0;
    let successfulPages = 0;

    try {
      console.log('🔄 Loading PDF document with PDF.js...');
      
      const pdfDoc = await getDocument({ data: bytes }).promise;
      totalPages = pdfDoc.numPages;
      
      console.log(`📖 PDF loaded successfully with ${totalPages} pages`);

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          console.log(`📄 Processing page ${pageNum}/${totalPages}...`);
          
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          
          if (pageText) {
            allText += pageText + '\n\n';
            successfulPages++;
            console.log(`✅ Page ${pageNum} processed, extracted ${pageText.length} characters`);
          } else {
            console.log(`⚠️ Page ${pageNum} contained no text`);
          }
        } catch (pageError) {
          console.error(`❌ Error processing page ${pageNum}:`, pageError);
          continue;
        }
      }

      if (!allText.trim()) {
        console.warn('⚠️ No text could be extracted from any pages');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No readable text found in the PDF document',
          method: 'PDF.js',
          pageCount: totalPages,
          successfulPages: successfulPages
        }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const cleanedText = allText
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      console.log(`✅ PDF text extraction completed: ${cleanedText.length} characters from ${successfulPages}/${totalPages} pages`);

      return new Response(JSON.stringify({ 
        success: true, 
        text: cleanedText,
        method: 'PDF.js',
        pageCount: totalPages,
        successfulPages: successfulPages
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (extractionError) {
      console.error('❌ PDF text extraction failed:', extractionError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Text extraction failed: ${extractionError.message}`,
        method: 'PDF.js',
        pageCount: totalPages,
        successfulPages: successfulPages
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Text extractor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Text extraction failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);
