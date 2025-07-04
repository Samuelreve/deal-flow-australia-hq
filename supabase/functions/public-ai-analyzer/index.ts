import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Validate file type - only text files for now
    if (file.type !== "text/plain") {
      return new Response(
        JSON.stringify({ 
          error: "Currently only text files (.txt) are supported.",
          receivedType: file.type
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // Read the file content
    const text = await file.text();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "File appears to be empty." }),
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