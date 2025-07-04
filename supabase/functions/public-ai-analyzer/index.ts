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
    // For DOCX files, implement comprehensive text extraction with multiple fallbacks
    console.log("🔧 Starting DOCX text extraction...");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(`📄 DOCX file size: ${uint8Array.length} bytes`);
      
      let extractedText = '';
      let extractionMethod = '';
      
      // Method 1: Try to find XML text elements (most reliable for DOCX)
      try {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const content = decoder.decode(uint8Array);
        
        // Look for Word document text patterns
        const patterns = [
          /<w:t[^>]*?>(.*?)<\/w:t>/gs,
          /<text[^>]*?>(.*?)<\/text>/gs,
          />\s*([A-Za-z][A-Za-z0-9\s.,!?;:'"()-]{10,})\s*</g
        ];
        
        for (let i = 0; i < patterns.length && extractedText.length < 100; i++) {
          const matches = [...content.matchAll(patterns[i])];
          if (matches.length > 0) {
            const text = matches
              .map(match => match[1] || match[0])
              .map(text => text.replace(/<[^>]*>/g, '').trim())
              .filter(text => text.length > 3)
              .join(' ');
            
            if (text.length > extractedText.length) {
              extractedText = text;
              extractionMethod = `XML pattern ${i + 1}`;
            }
          }
        }
      } catch (e) {
        console.log("❌ XML extraction failed:", e.message);
      }
      
      // Method 2: Binary text extraction if XML failed
      if (extractedText.length < 50) {
        try {
          console.log("🔄 Trying binary text extraction...");
          const chars = [];
          for (let i = 0; i < uint8Array.length; i++) {
            const byte = uint8Array[i];
            if (byte >= 32 && byte <= 126) {
              chars.push(String.fromCharCode(byte));
            } else if (byte === 10 || byte === 13) {
              chars.push(' ');
            }
          }
          
          const binaryText = chars.join('');
          const words = binaryText
            .split(/\s+/)
            .filter(word => word.length > 2 && /[a-zA-Z]/.test(word))
            .slice(0, 500); // Limit words to prevent huge text
          
          if (words.length > 0) {
            extractedText = words.join(' ');
            extractionMethod = 'binary extraction';
          }
        } catch (e) {
          console.log("❌ Binary extraction failed:", e.message);
        }
      }
      
      // Clean up extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
        .trim();
      
      console.log(`✅ DOCX extraction result: ${extractedText.length} characters using ${extractionMethod}`);
      
      // Always return something, never fail
      if (extractedText.length > 20) {
        return extractedText.substring(0, 10000);
      } else {
        // Provide a useful fallback message
        const fallbackText = `Microsoft Word Document (${file.name}) - File uploaded successfully. 
        
Document contains formatted content that requires advanced text extraction. The document appears to be a ${Math.round(file.size / 1024)}KB Word document with complex formatting.

Note: For optimal text analysis, consider saving the document as a plain text (.txt) file, which provides the most reliable text extraction for AI analysis.`;
        
        console.log("📝 Using fallback text for DOCX");
        return fallbackText;
      }
      
    } catch (error) {
      console.error("❌ DOCX processing error:", error);
      // Never throw - always return a descriptive message
      return `Microsoft Word Document (${file.name}) - Document uploaded successfully. File size: ${Math.round(file.size / 1024)}KB. The document structure uses advanced formatting that requires specialized text extraction. For immediate analysis, please save as plain text format.`;
    }
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
}

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  try {
    console.log(`📥 Received ${req.method} request`);
    
    // Handle CORS preflight requests immediately
    if (req.method === "OPTIONS") {
      console.log("✅ Handling OPTIONS preflight request");
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
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
    
    // Clean the text to remove problematic Unicode escape sequences
    const cleanedText = text
      .replace(/\\u[0-9a-fA-F]{4}/g, ' ') // Remove Unicode escape sequences like \u0000
      .replace(/\\[nrtbfv]/g, ' ') // Remove other escape sequences
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Generate simple analysis for now (we'll add OpenAI later)
    const analysis = `Document Analysis:

1. Document Type: Text document
2. Key Parties: [Analysis would identify parties here]
3. Main Purpose: [Contract purpose would be analyzed here]
4. Key Terms: [Important terms would be extracted here]
5. Important Dates: [Relevant dates would be identified here]

Content Preview: ${cleanedText.substring(0, 200)}...

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