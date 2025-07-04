
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to extract text from different file types
async function extractTextFromFile(fileBuffer: Uint8Array, mimeType: string): Promise<string> {
  console.log('📄 Extracting text from file type:', mimeType);
  
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    // Handle plain text files directly
    const text = new TextDecoder().decode(fileBuffer);
    console.log('✅ Text extraction successful:', text.length, 'characters');
    return text;
  } else if (mimeType === 'application/pdf') {
    // For now, return a message that PDF processing is not supported
    // This prevents the function from crashing
    throw new Error("PDF processing is temporarily disabled. Please convert your document to a text file (.txt) for analysis.");
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For now, return a message that DOCX processing is not supported
    // This prevents the function from crashing
    throw new Error("DOCX processing is temporarily disabled. Please convert your document to a text file (.txt) for analysis.");
  }
  // Handle any other unsupported MIME types
  throw new Error(`Unsupported document type: ${mimeType}. Please upload a text file (.txt) for analysis.`);
}

// Setup OpenAI client
function setupOpenAI() {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  console.log("🔑 Checking OpenAI API key:", {
    keyExists: !!apiKey,
    keyLength: apiKey?.length || 0
  });
  
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY is not set in environment variables");
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
  // Always set up CORS headers first to ensure they're available for all responses
  const origin = req.headers.get('origin');
  console.log(`📥 Received ${req.method} request from ${origin}`);
  
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

  // Check OpenAI API key early to prevent crashes
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY is not set");
    return new Response(
      JSON.stringify({
        error: "Service configuration error",
        message: "OpenAI API key not configured"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
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

    // Validate file type - currently only supporting text files
    const allowedTypes = [
      "text/plain"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: "Currently only text files (.txt) are supported. PDF and DOCX support is temporarily disabled.",
          supportedTypes: ["text/plain"]
        }),
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
