
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// CORS headers for public access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Helper function to extract text from different file types
async function extractTextFromFile(fileBuffer: Uint8Array, mimeType: string): Promise<string> {
  // For simple text files
  if (mimeType === 'text/plain') {
    return new TextDecoder().decode(fileBuffer);
  }
  
  // For PDFs - We'll use a simplified approach for the demo
  // In a production environment, you'd want to use proper PDF extraction libraries
  if (mimeType === 'application/pdf') {
    // For demo purposes, return a placeholder text
    console.log("PDF detected - would normally extract text with pdf-parse");
    return "This is placeholder text for PDF content. In production, actual PDF text extraction would occur.";
  }
  
  // For DOCX - Again, simplified for the demo
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    console.log("DOCX detected - would normally extract text with mammoth");
    return "This is placeholder text for DOCX content. In production, actual DOCX text extraction would occur.";
  }
  
  // Default fallback
  return "Text extraction not supported for this file type.";
}

// Setup OpenAI client
function setupOpenAI() {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  
  const configuration = new Configuration({ apiKey });
  return new OpenAIApi(configuration);
}

// Helper to analyze contract text with OpenAI
async function analyzeContractWithAI(text: string): Promise<string> {
  try {
    const openai = setupOpenAI();
    
    // Limit text length to avoid token limits
    const truncatedText = text.substring(0, 6000);
    
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
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
    
    let analysisText = response.data.choices[0]?.message?.content || "Analysis could not be generated.";
    
    // Add disclaimer
    analysisText += "\n\nDisclaimer: This AI analysis is for informational purposes only and should not be considered legal advice.";
    
    return analysisText;
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    return "An error occurred during contract analysis. Please try again later.";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: corsHeaders, status: 405 }
    );
  }

  try {
    // Parse the multipart form data to get the file
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided or invalid file" }),
        { headers: corsHeaders, status: 400 }
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
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Limit file size (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
        { headers: corsHeaders, status: 400 }
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
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Error in public-ai-analyzer:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to analyze document",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
