import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simple PDF text extraction function
async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log("🔧 Starting proper PDF text extraction, file size:", uint8Array.length);
    
    // Convert binary data to string for analysis
    const decoder = new TextDecoder('latin1'); // Use latin1 to preserve all bytes
    const pdfString = decoder.decode(uint8Array);
    
    // Check if PDF is encrypted
    if (pdfString.includes('/Encrypt')) {
      throw new Error("This PDF is encrypted or password-protected. Please use an unprotected PDF.");
    }
    
    let extractedText = '';
    
    // Method 1: Extract text from content streams
    const streamRegex = /stream\s*(.*?)\s*endstream/gs;
    const streamMatches = [...pdfString.matchAll(streamRegex)];
    
    console.log(`📄 Found ${streamMatches.length} streams in PDF`);
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch[1];
      
      // Check if stream contains text operations
      if (streamContent.includes('Tj') || streamContent.includes('TJ') || streamContent.includes('Td')) {
        // Extract text from PDF text operations
        const textMatches = [
          ...streamContent.matchAll(/\((.*?)\)\s*Tj/g),
          ...streamContent.matchAll(/\[(.*?)\]\s*TJ/g),
          ...streamContent.matchAll(/\((.*?)\)/g)
        ];
        
        for (const textMatch of textMatches) {
          const text = textMatch[1];
          if (text && text.length > 1) {
            // Clean the extracted text
            const cleanText = text
              .replace(/\\n/g, ' ')
              .replace(/\\r/g, ' ')
              .replace(/\\t/g, ' ')
              .replace(/\\\\/g, '\\')
              .replace(/\\(.)/g, '$1')
              .trim();
            
            if (cleanText.length > 2 && /[a-zA-Z]/.test(cleanText)) {
              extractedText += cleanText + ' ';
            }
          }
        }
      }
    }
    
    // Method 2: Look for uncompressed text content
    if (extractedText.length < 100) {
      console.log("🔄 Trying alternative text extraction...");
      
      // Look for readable text patterns
      const readableText = pdfString
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ') // Remove non-printable chars
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          /^[a-zA-Z0-9.,!?;:'"()-]+$/.test(word) &&
          /[a-zA-Z]/.test(word)
        )
        .join(' ');
      
      if (readableText.length > extractedText.length) {
        extractedText = readableText;
      }
    }
    
    // Clean and validate final text
    const finalText = extractedText
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`✅ PDF text extraction completed: ${finalText.length} characters`);
    
    if (finalText.length < 50) {
      throw new Error("Unable to extract readable text from this PDF. The document may use advanced compression, be image-based, or require OCR processing.");
    }
    
    return finalText;
    
  } catch (error) {
    console.error("❌ PDF extraction error:", error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

// Enhanced DOCX text extraction
async function extractDOCXText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log("🔧 Starting DOCX text extraction...");
    
    // Convert to string for pattern matching
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(uint8Array);
    
    let extractedText = '';
    
    // Method 1: Extract from Word XML text elements
    const xmlTextPatterns = [
      /<w:t[^>]*?>(.*?)<\/w:t>/gs,
      /<text[^>]*?>(.*?)<\/text>/gs,
    ];
    
    for (const pattern of xmlTextPatterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        const xmlText = matches
          .map(match => match[1])
          .filter(text => text && text.trim().length > 0)
          .map(text => text.replace(/<[^>]*>/g, '').trim())
          .join(' ');
        
        if (xmlText.length > extractedText.length) {
          extractedText = xmlText;
        }
      }
    }
    
    // Method 2: Byte-by-byte readable text extraction if XML method fails
    if (extractedText.length < 100) {
      console.log("🔄 Using byte-level text extraction for DOCX...");
      
      const readableChars = [];
      let consecutiveReadable = 0;
      
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        
        if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
          readableChars.push(String.fromCharCode(byte));
          consecutiveReadable++;
        } else {
          if (consecutiveReadable > 3) {
            readableChars.push(' ');
          }
          consecutiveReadable = 0;
        }
      }
      
      const rawText = readableChars.join('').replace(/\s+/g, ' ').trim();
      
      // Filter meaningful words
      const words = rawText.split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          /^[a-zA-Z0-9.,!?;:'"()-]+$/.test(word) &&
          /[a-zA-Z]/.test(word)
        );
      
      if (words.length > 10) {
        extractedText = words.join(' ');
      }
    }
    
    const finalText = extractedText
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`✅ DOCX extraction result: ${finalText.length} characters`);
    
    if (finalText.length < 50) {
      throw new Error("Unable to extract text from DOCX. Document may be corrupted, encrypted, or contain only images.");
    }
    
    return finalText;
    
  } catch (error) {
    console.error("❌ DOCX extraction error:", error);
    throw new Error(`DOCX text extraction failed: ${error.message}`);
  }
}

// Enhanced RTF text extraction
async function extractRTFText(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    console.log("🔧 Starting RTF text extraction...");
    
    // Advanced RTF parsing to remove control codes and extract plain text
    let cleanText = text
      // Remove RTF header and version info
      .replace(/^{\\rtf\d+[^{}]*/, '')
      // Remove font table
      .replace(/{\\fonttbl[^{}]*({[^{}]*})*[^{}]*}/g, '')
      // Remove color table
      .replace(/{\\colortbl[^{}]*}/g, '')
      // Remove style sheets
      .replace(/{\\stylesheet[^{}]*({[^{}]*})*[^{}]*}/g, '')
      // Remove document info
      .replace(/{\\info[^{}]*({[^{}]*})*[^{}]*}/g, '')
      // Remove control words with parameters
      .replace(/\\[a-zA-Z]+\d*\s?/g, ' ')
      // Remove control symbols
      .replace(/\\[^a-zA-Z\s]/g, '')
      // Remove remaining braces
      .replace(/[{}]/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`✅ RTF extraction result: ${cleanText.length} characters`);
    
    if (cleanText.length < 50) {
      throw new Error("Unable to extract sufficient text from RTF file.");
    }
    
    return cleanText;
    
  } catch (error) {
    console.error("❌ RTF extraction error:", error);
    throw new Error(`RTF text extraction failed: ${error.message}`);
  }
}

// Main text extraction function
async function extractText(file: File): Promise<string> {
  const fileType = file.type;
  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  
  console.log(`🔧 Starting text extraction for: ${file.name} (${fileType})`);
  
  if (fileType === "text/plain") {
    return await file.text();
  } 
  else if (fileType === "application/rtf" || fileType === "text/rtf" || fileType === "text/richtext" || fileExtension === "rtf") {
    return await extractRTFText(file);
  }
  else if (fileType === "application/pdf") {
    return await extractPDFText(file);
  }
  else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return await extractDOCXText(file);
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
}

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  try {
    console.log(`📥 Received ${req.method} request`);
    
    // Handle CORS preflight requests immediately
    if (req.method === "OPTIONS") {
      console.log("✅ Handling OPTIONS preflight request");
      return new Response(null, { headers: corsHeaders, status: 204 });
    }
    
    // Only allow POST requests
    if (req.method !== "POST") {
      console.log(`❌ Method ${req.method} not allowed`);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 405 
        }
      );
    }

    console.log("📝 Processing POST request...");
    
    // Parse the multipart form data to get the file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    
    console.log("📁 File received:", {
      name: file?.name || 'unknown',
      type: file?.type || 'unknown',
      size: file?.size || 0
    });
    
    console.log("🔍 DEBUGGING - Current timestamp:", new Date().toISOString());
    console.log("🔍 DEBUGGING - Function version: v3.0 - RTF support enabled");
    console.log("🔍 DEBUGGING - Detected file type:", file?.type);
    console.log("🔍 DEBUGGING - File extension:", file?.name?.split('.').pop()?.toLowerCase());
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Validate file type - support text, PDF, DOCX, and RTF files
    const supportedTypes = [
      "text/plain",
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
      "text/richtext",
      "application/x-rtf",
      "text/x-rtf",
      // Sometimes RTF files are detected as generic application types
      "application/octet-stream"
    ];
    
    // Get file extension as fallback
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['txt', 'pdf', 'docx', 'rtf'];
    
    console.log("🔍 DETAILED FILE ANALYSIS:", {
      fileName: file.name,
      mimeType: file.type,
      extension: fileExtension,
      fileSize: file.size,
      allSupportedTypes: supportedTypes,
      allSupportedExtensions: supportedExtensions
    });
    
    // Check both MIME type and file extension
    const isSupportedByMime = supportedTypes.includes(file.type);
    const isSupportedByExtension = supportedExtensions.includes(fileExtension || '');
    const isSupported = isSupportedByMime || isSupportedByExtension;
    
    console.log("🔍 VALIDATION RESULTS:", {
      isSupportedByMime,
      isSupportedByExtension,
      isSupported,
      finalDecision: isSupported ? "ACCEPT" : "REJECT"
    });
    
    if (!isSupported) {
      console.log("❌ File rejected - detailed analysis:", {
        mimeType: file.type,
        extension: fileExtension,
        reason: "Neither MIME type nor extension matched supported formats"
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Unsupported file type. Supported formats: .txt (text), .pdf (PDF documents), .docx (Word documents), .rtf (Rich Text Format)",
          receivedType: file.type,
          receivedExtension: fileExtension,
          supportedTypes,
          supportedExtensions,
          timestamp: new Date().toISOString(),
          debugInfo: {
            fileName: file.name,
            isSupportedByMime,
            isSupportedByExtension
          }
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    console.log("✅ File validation passed!");
    
    // Extract text from the file using appropriate method for file type
    console.log("🔧 Extracting text from file type:", file.type);
    let text: string;
    try {
      text = await extractText(file);
    } catch (extractionError) {
      console.error("❌ Text extraction failed:", extractionError);
      return new Response(
        JSON.stringify({ 
          error: extractionError instanceof Error ? extractionError.message : "Failed to extract text from file",
          fileType: file.type
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No readable text found in the file." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    console.log("✅ File processing successful, text length:", text.length);
    
    // Final text cleaning to remove any remaining problematic characters
    const cleanedText = text
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
    
    console.log("🧹 Text cleaned, final length:", cleanedText.length);
    console.log("📝 Extracted text preview:", cleanedText.substring(0, 500));
    
    // Log the complete extracted text for debugging
    console.log("📄 COMPLETE EXTRACTED TEXT FROM EDGE FUNCTION:");
    console.log("=".repeat(60));
    console.log(cleanedText);
    console.log("=".repeat(60));
    console.log(`File: ${file.name}, Type: ${file.type}, Total chars: ${cleanedText.length}`);
    
    // Generate simple analysis for now (we'll add OpenAI later)
    const analysis = `Document Analysis:

1. Document Type: Text document
2. Key Parties: [Analysis would identify parties here]
3. Main Purpose: [Contract purpose would be analyzed here]
4. Key Terms: [Important terms would be extracted here]
5. Important Dates: [Relevant dates would be identified here]

Content Preview: ${text.substring(0, 200)}...

Note: This is a simplified analysis. Full AI analysis will be implemented once basic functionality is confirmed.

Disclaimer: This AI analysis is for informational purposes only and should not be considered legal advice.`;
    
    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date().toISOString(),
        },
        text: cleanedText.substring(0, 5000), // Truncate text to avoid large responses
        analysis: analysis,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("❌ Error in public-ai-analyzer:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to analyze document",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});