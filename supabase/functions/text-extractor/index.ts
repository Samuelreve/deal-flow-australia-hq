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

    // Import OCR libraries
    const { renderPageAsImage } = await import("https://esm.sh/unpdf@0.11.0");
    const Tesseract = await import("https://esm.sh/tesseract.js@5.0.4");

    // Convert base64 to Uint8Array
    const binaryString = atob(fileBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract images from PDF pages for OCR
    const images = await renderPageAsImage(bytes, { scale: 2.0 });

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

    console.log('OCR TEXT START');
    let allText = '';
    
    // Process each page image with OCR
    for (let i = 0; i < imageArray.length; i++) {
      const image = imageArray[i];
      
      try {
        // Use Tesseract.js for OCR
        const { data: { text } } = await Tesseract.recognize(image, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress Page ${i + 1}: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        if (text && text.trim()) {
          allText += text + '\n\n';
          console.log(`Page ${i + 1} OCR completed: ${text.length} characters`);
        }
      } catch (ocrError) {
        console.error(`OCR error for page ${i + 1}:`, ocrError.message);
        // Continue with other pages even if one fails
      }
    }
    
    console.log('OCR TEXT END');

    if (!allText.trim()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No text could be extracted via OCR from any page' 
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

    return new Response(JSON.stringify({ 
      success: true, 
      text: cleanedText,
      method: 'ocr',
      pageCount: imageArray.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ OCR Text extractor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'OCR extraction failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);