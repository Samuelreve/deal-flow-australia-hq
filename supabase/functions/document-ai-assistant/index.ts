import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAuth, verifyDealParticipant, getUserDealRole } from "../_shared/rbac.ts";
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
  documentVersionId?: string; // Added for document summarization
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

async function fetchDealData(dealId: string, supabaseAdmin: any) {
  try {
    // Fetch basic deal information
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('*, seller:seller_id(name, email), buyer:buyer_id(name, email)')
      .eq('id', dealId)
      .single();
      
    if (dealError) throw new Error(`Error fetching deal: ${dealError.message}`);
    if (!dealData) throw new Error("Deal not found");
    
    // Fetch all participants
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('deal_participants')
      .select('*, profile:user_id(id, name, email, role)')
      .eq('deal_id', dealId);
      
    if (participantsError) throw new Error(`Error fetching participants: ${participantsError.message}`);
    
    // Group participants by role
    const participantsByRole: Record<string, any[]> = {};
    participants.forEach(participant => {
      const role = participant.role;
      if (!participantsByRole[role]) {
        participantsByRole[role] = [];
      }
      participantsByRole[role].push(participant.profile);
    });
    
    return {
      deal: dealData,
      participants: participantsByRole
    };
  } catch (error) {
    console.error("Error fetching deal data:", error);
    throw error;
  }
}

async function handleGenerateTemplate(content: string, dealId: string, userId: string, templateType: string, context?: Record<string, any>) {
  // Get Supabase admin client from shared module
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Verify user is a participant and fetch their role
    const userDealRole = await getUserDealRole(userId, dealId);
    
    // Check if role is authorized for template generation
    const authorizedRoles = ['admin', 'seller', 'lawyer'];
    if (!authorizedRoles.includes(userDealRole.toLowerCase())) {
      throw new Error(`Users with role '${userDealRole}' are not authorized to generate templates.`);
    }
    
    // Fetch comprehensive deal data
    const dealData = await fetchDealData(dealId, supabaseAdmin);
    
    // Construct prompt based on template type and deal data
    const systemPrompt = "You are a legal document drafting assistant specializing in business and real estate transactions. Create legally-sound document templates based on the provided information.";
    
    let userPrompt = `Generate a draft ${templateType} document based on the following deal information:\n\n`;
    
    // Add deal details to prompt
    userPrompt += `Deal Title: ${dealData.deal.title}\n`;
    if (dealData.deal.description) {
      userPrompt += `Deal Description: ${dealData.deal.description}\n`;
    }
    
    // Add seller information
    if (dealData.participants.seller) {
      userPrompt += `Seller(s): ${dealData.participants.seller.map(s => s.name).join(', ')}\n`;
    } else if (dealData.deal.seller) {
      userPrompt += `Seller: ${dealData.deal.seller.name}\n`;
    }
    
    // Add buyer information
    if (dealData.participants.buyer) {
      userPrompt += `Buyer(s): ${dealData.participants.buyer.map(b => b.name).join(', ')}\n`;
    } else if (dealData.deal.buyer) {
      userPrompt += `Buyer: ${dealData.deal.buyer.name}\n`;
    }
    
    // Add specific requirements from content
    userPrompt += `\nSpecific Requirements: ${content}\n\n`;
    
    // Add template-specific instructions
    userPrompt += `Please generate a complete ${templateType} that includes all standard clauses typically found in such documents. Format the document with proper headings, sections, and legal language. Include placeholders for signatures where appropriate.`;
    
    // Add any additional context if provided
    if (context) {
      if (context.jurisdiction) {
        userPrompt += `\nThis document should comply with ${context.jurisdiction} laws and regulations.`;
      }
      if (context.additionalClauses) {
        userPrompt += `\nPlease include these additional clauses: ${context.additionalClauses.join(', ')}.`;
      }
    }
    
    console.log(`Generating template for deal ${dealId}, template type: ${templateType}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    return {
      template: response.choices[0].message.content,
      disclaimer: "This document template is provided as a starting point only and should be reviewed by a qualified legal professional before use."
    };
  } catch (error) {
    console.error(`Error generating template for deal ${dealId}:`, error);
    throw error;
  }
}

async function handleSummarizeDocument(content: string, dealId?: string, documentId?: string, documentVersionId?: string) {
  // If content is directly provided (e.g., from the frontend), use that
  let documentContent = content;
  
  // If documentId and documentVersionId are provided but no content, fetch the document content
  if (documentId && documentVersionId && !content.trim() && dealId) {
    try {
      documentContent = await fetchDocumentContent(dealId, documentId, documentVersionId);
    } catch (error) {
      console.error("Error fetching document content:", error);
      throw new Error(`Failed to retrieve document content: ${error.message}`);
    }
  }

  if (!documentContent || documentContent.trim() === "") {
    throw new Error("No document content provided for summarization");
  }

  // Limit content length for API efficiency
  const maxContentLength = 12000; // Approximate token limit for GPT models
  const trimmedContent = documentContent.length > maxContentLength 
    ? documentContent.substring(0, maxContentLength) + "... [content truncated due to length]" 
    : documentContent;

  // Call OpenAI for summarization
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using a more efficient model for summarization
    messages: [
      {
        role: "system",
        content: "You are a document summarization assistant specialized in business and legal documents. Provide clear, accurate summaries focusing on key points, obligations, and important details. Format your response with clear sections and bullet points where appropriate."
      },
      {
        role: "user",
        content: `Please summarize the following document content:\n\n${trimmedContent}`
      }
    ],
    temperature: 0.3, // Lower temperature for more factual summaries
    max_tokens: 800  // Adjust based on desired summary length
  });

  return {
    summary: response.choices[0].message.content,
    disclaimer: "This summary is provided for convenience only and does not capture all details of the original document."
  };
}

// New function to fetch document content from Supabase Storage
async function fetchDocumentContent(dealId: string, documentId: string, documentVersionId: string) {
  // Get Supabase admin client
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // First, get the storage path for the document version
    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('document_versions')
      .select('storage_path, document_id')
      .eq('id', documentVersionId)
      .eq('document_id', documentId)
      .single();
    
    if (versionError || !versionData) {
      throw new Error(`Error fetching document version: ${versionError?.message || "Version not found"}`);
    }
    
    // Verify this document belongs to the specified deal
    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('documents')
      .select('deal_id')
      .eq('id', documentId)
      .single();
    
    if (documentError || !documentData) {
      throw new Error(`Error fetching document: ${documentError?.message || "Document not found"}`);
    }
    
    if (documentData.deal_id !== dealId) {
      throw new Error("Document does not belong to specified deal");
    }
    
    // Now download the file from storage
    const storagePath = `${dealId}/${versionData.storage_path}`;
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from('deal-documents')
      .download(storagePath);
    
    if (fileError || !fileData) {
      throw new Error(`Error downloading document from storage: ${fileError?.message}`);
    }
    
    // Convert Blob to text
    const text = await fileData.text();
    return text;
  } catch (error) {
    console.error(`Error in fetchDocumentContent for deal ${dealId}, document ${documentId}:`, error);
    throw error;
  }
}

// Import functions from shared modules for authentication and authorization
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function handleRequest(req: Request): Promise<Response> {
  try {
    const { operation, content, context, dealId, userId, documentId, documentVersionId } = await req.json() as RequestPayload & { documentVersionId?: string };
    
    if (!operation || !dealId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the request details (excluding content for privacy/security)
    console.log(`Processing ${operation} request for deal ${dealId} from user ${userId}`);

    // Verify the user is a participant in the deal
    try {
      await verifyDealParticipant(userId, dealId);
    } catch (error) {
      console.error("Authorization error:", error);
      return new Response(
        JSON.stringify({ error: "Authorization error", details: error.message }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    switch (operation) {
      case "explain_clause":
        result = await handleExplainClause(content, context);
        break;
      case "generate_template":
        const templateType = context?.templateType || "Agreement";
        result = await handleGenerateTemplate(content, dealId, userId, templateType, context);
        break;
      case "summarize_document":
        result = await handleSummarizeDocument(content, dealId, documentId, documentVersionId);
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
