import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Use the proper text-extractor service instead of broken implementations
async function extractTextFromFile(file: File): Promise<string> {
  try {
    console.log("🔧 Starting text extraction using text-extractor service:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    // For plain text files, extract directly
    if (file.type === 'text/plain') {
      const text = await file.text();
      console.log(`✅ Plain text extraction successful: ${text.length} characters`);
      return text;
    }

    // For other file types, use the text-extractor service
    const arrayBuffer = await file.arrayBuffer();
    
    // Use Deno's built-in base64 encoding for proper binary data handling
    const bytes = new Uint8Array(arrayBuffer);
    
    // Import Deno's base64 encoder for proper binary handling
    const { encode } = await import("https://deno.land/std@0.170.0/encoding/base64.ts");
    const base64 = encode(bytes);

    console.log('📤 Calling text-extractor service...');

    // Call the text-extractor Edge Function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/text-extractor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        fileBase64: base64,
        mimeType: file.type,
        fileName: file.name
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Text extraction service error (${response.status}):`, errorText);
      throw new Error(`Text extraction service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error('❌ Text extraction failed:', result.error);
      throw new Error(result.error || "Text extraction failed");
    }

    console.log(`✅ Text extraction successful: ${result.text.length} characters`);
    return result.text;

  } catch (error) {
    console.error("❌ Text extraction error:", error);
    throw new Error(`Text extraction failed: ${error.message}`);
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
    return await extractTextFromFile(file);
  }
  else if (fileType === "application/pdf") {
    return await extractTextFromFile(file);
  }
  else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return await extractTextFromFile(file);
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
}

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
    
    // Extract text from the file using the proper text-extractor service
    console.log("🔧 Extracting text from file type:", file.type);
    let text: string;
    try {
      text = await extractTextFromFile(file);
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
      .replace(new RegExp(String.fromCharCode(0), 'g'), '') // Remove null bytes
      .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + '-' + String.fromCharCode(159) + ']', 'g'), '') // Remove control characters
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