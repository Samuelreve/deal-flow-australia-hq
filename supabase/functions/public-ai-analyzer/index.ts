import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Text extraction function for different file types
async function extractText(file: File): Promise<string> {
  const fileType = file.type;
  const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
  
  if (fileType === "text/plain") {
    return await file.text();
  } 
  else if (fileType === "application/rtf" || fileType === "text/rtf" || fileType === "text/richtext" || fileExtension === "rtf") {
    // RTF (Rich Text Format) extraction
    try {
      const text = await file.text();
      
      // Basic RTF parsing - remove RTF control codes and extract plain text
      let cleanText = text
        // Remove RTF header
        .replace(/^{\\rtf1[^}]*}/, '')
        // Remove font table
        .replace(/{\\fonttbl[^}]*}/g, '')
        // Remove color table
        .replace(/{\\colortbl[^}]*}/g, '')
        // Remove style sheets
        .replace(/{\\stylesheet[^}]*}/g, '')
        // Remove info group
        .replace(/{\\info[^}]*}/g, '')
        // Remove control words with parameters
        .replace(/\\[a-z]+\d*\s?/g, '')
        // Remove control symbols
        .replace(/\\[^a-z\s]/g, '')
        // Remove remaining braces and cleanup
        .replace(/[{}]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanText.length > 50) {
        return cleanText;
      }
      
      throw new Error("Could not extract sufficient text from RTF file");
    } catch (error) {
      throw new Error(`RTF text extraction failed: ${error.message}`);
    }
  }
  else if (fileType === "application/pdf") {
    // For PDF files, we'll try to extract text using a simpler approach
    // Note: Full PDF parsing is complex, this is a basic implementation
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const text = decoder.decode(uint8Array);
      
      // Basic PDF text extraction - look for text between BT and ET markers
      const textMatches = text.match(/BT\s*(.*?)\s*ET/gs);
      if (textMatches && textMatches.length > 0) {
        let extractedText = textMatches.join(' ')
          .replace(/BT|ET/g, '')
          .replace(/\([^)]*\)\s*Tj/g, '$1')
          .replace(/Tj/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extractedText.length > 50) {
          return extractedText;
        }
      }
      
      // Fallback: try to find readable text in the PDF
      const readableText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (readableText.length > 100) {
        return readableText.substring(0, 10000); // Limit size
      }
      
      throw new Error("Could not extract readable text from PDF");
    } catch (error) {
      throw new Error(`PDF text extraction failed: ${error.message}. Please try converting to text format first.`);
    }
  }
  else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // For DOCX files - simplified text extraction that focuses on readable content
    console.log("🔧 Starting DOCX text extraction...");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(`📄 DOCX file size: ${uint8Array.length} bytes`);
      
      // Convert to string and look for readable text patterns
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(uint8Array);
      
      // Extract text between word processing tags - more comprehensive patterns
      let extractedText = '';
      
      // Try multiple text extraction patterns for Word documents
      const textPatterns = [
        /<w:t[^>]*?>(.*?)<\/w:t>/gs,           // Word text elements
        /<text[^>]*?>(.*?)<\/text>/gs,         // Generic text elements
        />\s*([A-Z][a-zA-Z0-9\s.,!?;:'"()-]{20,})\s*</g  // Longer text blocks
      ];
      
      for (const pattern of textPatterns) {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          const patternText = matches
            .map(match => match[1] || match[0])
            .map(text => text.replace(/<[^>]*>/g, '').trim())
            .filter(text => text.length > 10)
            .join(' ');
          
          if (patternText.length > extractedText.length) {
            extractedText = patternText;
          }
        }
      }
      
      // If XML patterns didn't work, try extracting readable ASCII text
      if (extractedText.length < 100) {
        console.log("🔄 Trying ASCII text extraction...");
        const readableChars = [];
        let consecutiveReadable = 0;
        
        for (let i = 0; i < uint8Array.length; i++) {
          const byte = uint8Array[i];
          
          // Check for readable ASCII characters
          if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
            readableChars.push(String.fromCharCode(byte));
            consecutiveReadable++;
          } else {
            // Add space to separate words when encountering non-readable bytes
            if (consecutiveReadable > 3) {
              readableChars.push(' ');
            }
            consecutiveReadable = 0;
          }
        }
        
        const asciiText = readableChars.join('')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Extract meaningful words (filter out control codes and short fragments)
        const words = asciiText.split(/\s+/)
          .filter(word => 
            word.length > 2 && 
            /^[a-zA-Z0-9.,!?;:'"()-]+$/.test(word) &&
            !/^[^a-zA-Z]*$/.test(word)  // Must contain at least one letter
          );
        
        if (words.length > 10) {
          extractedText = words.join(' ');
          console.log(`✅ ASCII extraction found ${words.length} words`);
        }
      }
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`✅ DOCX extraction result: ${extractedText.length} characters`);
      console.log(`📝 First 200 chars: ${extractedText.substring(0, 200)}`);
      
      if (extractedText.length > 50) {
        return extractedText;
      } else {
        // Return a clear indication that we couldn't extract meaningful text
        return `This appears to be a Microsoft Word document (${file.name}) that contains complex formatting or is password protected. 
        
For best results with AI analysis, please:
1. Save the Word document as a plain text (.txt) file, or
2. Copy and paste the text content directly into a text file

This will ensure accurate text extraction and optimal AI analysis.`;
      }
      
    } catch (error) {
      console.error("❌ DOCX processing error:", error);
      return `Microsoft Word Document Processing Error: Could not extract text from ${file.name}. Please save the document as a plain text (.txt) file for analysis.`;
    }
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
        text: text.substring(0, 5000), // Truncate text to avoid large responses
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