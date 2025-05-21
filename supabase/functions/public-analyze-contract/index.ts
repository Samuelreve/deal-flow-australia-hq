
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { parse } from "https://deno.land/std@0.170.0/flags/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the form data
    const formData = await req.formData();
    const file = formData.get("file");

    // Validate file exists
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text content from the file
    let documentText = "";
    
    if (file.type === "text/plain") {
      // For text files, just read the text
      documentText = await file.text();
    } else if (file.type === "application/pdf" || 
              file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // For PDF and DOCX, we'll use a simple approach for now since we can't easily
      // use libraries like pdf-parse or mammoth in Deno edge functions
      // In a production environment, you would use a proper document parsing service

      // For demonstration purposes, we'll extract text from the first part of the file
      // This is NOT a proper implementation for PDFs or DOCX files
      // In production, use a document processing service or API
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Try to extract some text - this is just a placeholder
      documentText = "Document content extraction from " + file.name + 
        " (Note: This is a simplified extraction. In production, use proper PDF/DOCX parsing).\n\n";
      
      // Add some bytes as text if it's not a PDF (for demonstration)
      if (file.type === "text/plain") {
        const decoder = new TextDecoder("utf-8");
        documentText += decoder.decode(bytes.slice(0, 10000)); // First 10KB as UTF-8
      } else {
        documentText += "[Document content would be properly extracted here]";
      }
    }

    // Trim document text to a reasonable length for AI processing
    const MAX_TEXT_LENGTH = 15000;
    const trimmedText = documentText.length > MAX_TEXT_LENGTH
      ? documentText.substring(0, MAX_TEXT_LENGTH) + "... [content truncated due to length]"
      : documentText;

    // Process with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful contract analysis assistant. Summarize the key terms and sections of the following contract document in simple, non-legal terms. Then, list the parties involved, the contract type, and any key obligations or liabilities.

Important Rules:
1. Answer ONLY using what is explicitly stated in the document. Do NOT invent information or speculate.
2. Do NOT provide legal advice.
3. If the answer is NOT explicitly available, state 'I cannot find that information in the provided text.'
4. If this does not appear to be a contract, politely inform the user and provide a brief summary of what the document contains instead.`
        },
        {
          role: "user",
          content: `Contract Document Content:
${trimmedText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const analysis = response.choices[0].message.content;
    const disclaimer = "Disclaimer: This tool provides general legal information, not legal advice. Always consult a lawyer for final review.";

    return new Response(
      JSON.stringify({ 
        analysis,
        disclaimer
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in public-analyze-contract:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to analyze contract. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
