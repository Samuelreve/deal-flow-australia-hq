import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import PDF.js for direct text extraction (much more reliable than OCR)
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

    console.log('🔍 Starting PDF text extraction for:', fileName);

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

    // Convert base64 to Uint8Array with better error handling
    let bytes;
    try {
      const binaryString = atob(cleanBase64);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('📄 File converted to bytes:', bytes.length);
      
      // Validate minimum PDF size (PDF files should be at least 100 bytes)
      if (bytes.length < 100) {
        throw new Error('File too small to be a valid PDF');
      }
      
      // Check PDF magic number
      const pdfHeader = new TextDecoder().decode(bytes.slice(0, 4));
      if (pdfHeader !== '%PDF') {
        throw new Error('File is not a valid PDF - missing PDF header');
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

    // Extract text directly from PDF using PDF.js
    let allText = '';
    let totalPages = 0;
    let successfulPages = 0;

    try {
      console.log('🔄 Loading PDF document with PDF.js...');
      
      // Load PDF document
      const pdfDoc = await getDocument({ data: bytes }).promise;
      totalPages = pdfDoc.numPages;
      
      console.log(`📖 PDF loaded successfully with ${totalPages} pages`);

      // Extract text from each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          console.log(`📄 Processing page ${pageNum}/${totalPages}...`);
          
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine text items into readable text
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
          // Continue with next page instead of failing completely
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

      // Clean up the extracted text
      const cleanedText = allText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
        .trim();

      console.log(`✅ PDF text extraction completed successfully: ${cleanedText.length} characters from ${successfulPages}/${totalPages} pages`);

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
    console.error('❌ PDF text extractor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `PDF text extraction failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);