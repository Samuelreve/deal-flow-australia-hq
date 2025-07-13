import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

    console.log('🔍 Starting OCR extraction for:', fileName);

    // Convert base64 to Uint8Array
    const binaryString = atob(fileBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('📄 File converted to bytes:', bytes.length);

    // Import OCR libraries with error handling
    let renderPageAsImage, Tesseract;
    try {
      const unpdfModule = await import("https://esm.sh/unpdf@0.11.0");
      renderPageAsImage = unpdfModule.renderPageAsImage;
      console.log('✅ unpdf loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load unpdf:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to load PDF processing library' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      Tesseract = await import("https://esm.sh/tesseract.js@4.1.1");
      console.log('✅ Tesseract loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Tesseract:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to load OCR library' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract images from PDF pages for OCR
    let images;
    try {
      console.log('🔍 Rendering PDF pages as images...');
      images = await renderPageAsImage(bytes, { 
        scale: 1.5,  // Reduced scale for stability
        background: 'white'
      });
      console.log('✅ PDF pages rendered successfully');
    } catch (error) {
      console.error('❌ Failed to render PDF pages:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to convert PDF pages to images for OCR' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!images || (Array.isArray(images) && images.length === 0)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No images could be extracted from PDF for OCR' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle both array and single image responses
    const imageArray = Array.isArray(images) ? images : [images];
    console.log(`📄 Processing ${imageArray.length} pages with OCR`);

    console.log('OCR TEXT START');
    let allText = '';
    let successfulPages = 0;
    
    // Process each page image with OCR - with better error handling
    for (let i = 0; i < imageArray.length; i++) {
      const image = imageArray[i];
      
      try {
        console.log(`🔍 Starting OCR for page ${i + 1}/${imageArray.length}`);
        
        // Create worker with proper error handling
        const worker = await Tesseract.createWorker();
        
        try {
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          
          console.log(`⚙️ Tesseract worker initialized for page ${i + 1}`);
          
          // Perform OCR with timeout protection
          const { data: { text } } = await worker.recognize(image, {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress Page ${i + 1}: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          
          await worker.terminate();
          
          if (text && text.trim()) {
            allText += text + '\n\n';
            successfulPages++;
            console.log(`✅ Page ${i + 1} OCR completed: ${text.length} characters`);
          } else {
            console.log(`⚠️ Page ${i + 1} OCR returned no text`);
          }
          
        } catch (workerError) {
          console.error(`❌ OCR worker error for page ${i + 1}:`, workerError);
          await worker.terminate().catch(() => {}); // Cleanup even if it fails
        }
        
      } catch (pageError) {
        console.error(`❌ OCR error for page ${i + 1}:`, pageError.message);
        // Continue with other pages even if one fails
      }
    }
    
    console.log('OCR TEXT END');
    console.log(`📊 OCR Summary: ${successfulPages}/${imageArray.length} pages processed successfully`);

    if (!allText.trim()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `No text could be extracted via OCR from any of the ${imageArray.length} pages` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean up the OCR text
    const cleanedText = allText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();

    console.log(`✅ OCR extraction completed successfully: ${cleanedText.length} characters`);

    return new Response(JSON.stringify({ 
      success: true, 
      text: cleanedText,
      method: 'ocr',
      pageCount: imageArray.length,
      successfulPages: successfulPages
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ OCR Text extractor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `OCR extraction failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);