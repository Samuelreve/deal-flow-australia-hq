
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";
import pdfParse from "https://esm.sh/pdf-parse@1.1.1";
import mammoth from "https://esm.sh/mammoth@1.6.0";

// CORS headers for public access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
// Helper function to extract text from different file types
async function extractTextFromFile(fileBuffer: Uint8Array, mimeType: string): Promise<string> {
  
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    // Handle plain text files directly
    return new TextDecoder().decode(fileBuffer);
  } else if (mimeType === 'application/pdf') {
    // PDF Text Extraction
    try {
      console.log('📄 Extracting text from PDF...');
      // Use pdf-parse to extract text from the PDF buffer
      const data = await pdfParse(fileBuffer);
      if (data && data.text) {
        // Ensure text is trimmed and has content
        const extracted = data.text.trim();
        if (extracted.length < 50) {
          console.warn('PDF extracted text too short for analysis:', extracted.substring(0, 50));
          throw new Error("Insufficient text extracted from PDF. Document might be scanned, empty, or unreadable.");
        }
        console.log('✅ PDF text extraction successful:', extracted.length, 'characters');
        return extracted;
      }
      throw new Error("No readable text content found in PDF.");
    } catch (e: any) {
      console.error('PDF parsing error (pdf-parse):', e.message);
      throw new Error(`Failed to extract text from PDF. It might be scanned or corrupted: ${e.message}`);
    }
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // DOCX Text Extraction
    try {
      console.log('📄 Extracting text from DOCX...');
      // mammoth expects an ArrayBuffer, so use the fileBuffer's ArrayBuffer
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer.buffer });
      if (result && result.value) {
        const extracted = result.value.trim();
        if (extracted.length < 50) {
          console.warn('DOCX extracted text too short for analysis:', extracted.substring(0, 50));
          throw new Error("Insufficient text extracted from DOCX. Document might be too short, empty, or unreadable.");
        }
        console.log('✅ DOCX text extraction successful:', extracted.length, 'characters');
        return extracted;
      }
      throw new Error("No readable text content found in DOCX.");
    } catch (e: any) {
      console.error('DOCX parsing error (mammoth):', e.message);
      throw new Error(`Failed to extract text from DOCX. It might be corrupted or unsupported format: ${e.message}`);
    }
  }
  // Handle any other unsupported MIME types
  throw new Error(`Unsupported document type for text extraction: ${mimeType}.`);
}

// Setup OpenAI client
function setupOpenAI() {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  
  return new OpenAI({ apiKey });
}

// Helper to analyze contract text with OpenAI
async function analyzeContractWithAI(text: string): Promise<string> {
  try {
    const openai = setupOpenAI();
    
    // Limit text length to avoid token limits
    const truncatedText = text.substring(0, 6000);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful contract analysis assistant. Provide concise summary of legal documents."
        },
        {
          role: "user",
          content: `Analyze this contract and provide a summary of key terms and obligations:
          
${truncatedText}

Format your response with these sections:
1. Document Type
2. Key Parties
3. Main Purpose
4. Key Terms
5. Important Dates`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    let analysisText = completion.choices[0]?.message?.content || "Analysis could not be generated.";
    
    // Add disclaimer
    analysisText += "\n\nDisclaimer: This AI analysis is for informational purposes only and should not be considered legal advice.";
    
    return analysisText;
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    return "An error occurred during contract analysis. Please try again later.";
  }
}

serve(async (req) => {
  console.log(`📥 Received ${req.method} request from ${req.headers.get('origin')}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS preflight request");
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 405 
      }
    );
  }

  try {
    console.log("📝 Processing POST request...");
    
    // Parse the multipart form data to get the file
    console.log("📦 Parsing form data...");
    const formData = await req.formData();
    const file = formData.get("file");
    
    console.log("📁 File received:", {
      name: file instanceof File ? file.name : 'unknown',
      type: file instanceof File ? file.type : 'unknown',
      size: file instanceof File ? file.size : 0
    });
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided or invalid file" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Validate file type
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Please upload a .txt, .pdf, or .docx file." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // Limit file size (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // Convert file to buffer
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    
    // Extract text from file
    const text = await extractTextFromFile(fileBuffer, file.type);
    
    // Generate file metadata
    const metadata = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    };
    
    // Analyze the contract with AI
    const analysis = await analyzeContractWithAI(text);
    
    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        metadata,
        text: text.substring(0, 10000), // Truncate text to avoid large responses
        analysis,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Error in public-ai-analyzer:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to analyze document",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
