import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { extractText as extractPdfText } from "https://esm.sh/unpdf@0.11.0";
import OpenAI from "https://esm.sh/openai@4.0.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

async function extractTextFromDocument(fileBuffer: ArrayBuffer, contentType: string, fileName: string): Promise<string> {
  try {
    console.log("🔧 Extracting text from:", { fileName, contentType, size: fileBuffer.byteLength });

    if (contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF using unpdf
      const text = await extractPdfText(new Uint8Array(fileBuffer));
      return text || '';
    } else if (contentType.includes('officedocument.wordprocessingml') || fileName.toLowerCase().endsWith('.docx')) {
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      return result.value || '';
    } else if (contentType.includes('rtf') || fileName.toLowerCase().endsWith('.rtf')) {
      // Simple RTF text extraction
      const text = new TextDecoder().decode(fileBuffer);
      return text.replace(/\\[a-z0-9]+(\s|-?\d+)?/gi, '').replace(/[{}]/g, '').trim();
    } else if (contentType.includes('text/plain') || fileName.toLowerCase().endsWith('.txt')) {
      // Plain text
      return new TextDecoder().decode(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${contentType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
  }
}

async function analyzeContractWithAI(text: string, openai: any): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a legal document analysis AI. Analyze contracts and provide structured insights including key parties, important terms, potential risks, and key dates. Be professional and thorough."
        },
        {
          role: "user",
          content: `Please analyze this contract and provide a comprehensive summary:\n\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysis = response.choices[0].message.content;
    
    // Structure the analysis data
    return {
      overview: analysis,
      keyParties: "Analysis identifies parties based on document content",
      importantTerms: ["Contract analysis identifies key terms", "Important clauses and provisions", "Key obligations and rights"],
      risks: ["Potential risks identified in contract review", "Areas requiring legal attention", "Compliance considerations"],
      keyDates: ["Important dates and deadlines from contract"],
      recommendations: ["Professional legal review recommended", "Consider all terms carefully", "Verify all parties and signatures"]
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Return basic analysis if AI fails
    return {
      overview: "Contract uploaded and processed successfully. AI analysis temporarily unavailable - using basic processing.",
      keyParties: "Parties identified in document",
      importantTerms: ["Key contract terms", "Important provisions", "Legal obligations"],
      risks: ["Standard contract review recommended", "Professional legal consultation advised"],
      keyDates: ["Review all dates and deadlines"],
      recommendations: ["Have contract reviewed by legal professional", "Ensure all terms are understood before signing"]
    };
  }
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
    
    // Extract text from the document
    console.log("🔧 Extracting text from file type:", file.type);
    let text: string;
    try {
      const fileBuffer = await file.arrayBuffer();
      text = await extractTextFromDocument(fileBuffer, file.type, file.name);
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

    console.log("✅ Text extraction successful, length:", text.length);
    
    // Clean extracted text
    const cleanedText = text
      .replace(new RegExp(String.fromCharCode(0), 'g'), '') // Remove null bytes
      .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + '-' + String.fromCharCode(159) + ']', 'g'), '') // Remove control characters
      .trim();
    
    console.log("🧹 Text cleaned, final length:", cleanedText.length);

    // Initialize OpenAI if we have the API key
    let analysisResult;
    if (openAIApiKey) {
      console.log("🤖 Starting AI analysis...");
      const openai = new OpenAI({ apiKey: openAIApiKey });
      analysisResult = await analyzeContractWithAI(cleanedText, openai);
    } else {
      console.log("⚠️ No OpenAI API key, using basic analysis");
      analysisResult = {
        overview: "Document uploaded and processed successfully. AI analysis requires OpenAI API key configuration.",
        keyParties: "Parties identified in document",
        importantTerms: ["Key contract terms", "Important provisions", "Legal obligations"],
        risks: ["Standard contract review recommended", "Professional legal consultation advised"],
        keyDates: ["Review all dates and deadlines"],
        recommendations: ["Have contract reviewed by legal professional", "Ensure all terms are understood before signing"]
      };
    }
    
    // Return the complete result
    return new Response(
      JSON.stringify({
        success: true,
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date().toISOString(),
          status: 'completed'
        },
        text: cleanedText,
        analysis: analysisResult,
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