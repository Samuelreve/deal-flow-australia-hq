
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

// Define operation types for the document assistant
type OperationType = "explain_clause" | "generate_template" | "summarize_document";

interface RequestPayload {
  operation: OperationType;
  dealId: string;
  documentId?: string;
  content: string;
  userId: string;
  context?: Record<string, any>;
}

async function handleExplainClause(content: string, context?: Record<string, any>) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful legal assistant specializing in real estate deals and contracts. Explain legal clauses in clear, simple language without providing legal advice."
      },
      {
        role: "user",
        content: `Please explain this legal clause in simple terms: "${content}"`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return {
    explanation: response.choices[0].message.content,
    disclaimer: "This explanation is provided for informational purposes only and should not be considered legal advice. Consult with a qualified legal professional for advice specific to your situation."
  };
}

async function handleGenerateTemplate(content: string, context?: Record<string, any>) {
  const dealType = context?.dealType || "standard";
  const parties = context?.parties || [];
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a document template assistant for real estate deals. Generate document templates based on the given criteria."
      },
      {
        role: "user",
        content: `Generate a ${dealType} document template for: ${content}. Include placeholders for the following parties: ${JSON.stringify(parties)}.`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return {
    template: response.choices[0].message.content,
    disclaimer: "This document template is provided as a starting point only and should be reviewed by a qualified legal professional before use."
  };
}

async function handleSummarizeDocument(content: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a document summarization assistant. Provide concise, accurate summaries of legal documents."
      },
      {
        role: "user",
        content: `Summarize the following document content: "${content}"`
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  return {
    summary: response.choices[0].message.content,
    disclaimer: "This summary is provided for convenience only and does not capture all details of the original document."
  };
}

async function handleRequest(req: Request): Promise<Response> {
  try {
    const { operation, content, context, dealId, userId } = await req.json() as RequestPayload;
    
    if (!operation || !content || !dealId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the request details (excluding content for privacy/security)
    console.log(`Processing ${operation} request for deal ${dealId} from user ${userId}`);

    let result;
    switch (operation) {
      case "explain_clause":
        result = await handleExplainClause(content, context);
        break;
      case "generate_template":
        result = await handleGenerateTemplate(content, context);
        break;
      case "summarize_document":
        result = await handleSummarizeDocument(content);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing document AI request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleRequest(req);
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
