
import { fetchDocumentContent } from "./document-content.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Checks if a user is a participant in a deal with an authorized role
 */
async function verifyAuthorizedDealParticipant(userId: string, dealId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('deal_participants')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  // Check if user has an authorized role for contract analysis
  // This can be customized based on your application's role requirements
  const authorizedRoles = ['seller', 'buyer', 'lawyer', 'admin'];
  return authorizedRoles.includes(data.role.toLowerCase());
}

/**
 * Handle contract summarization operation
 */
export async function handleSummarizeContract(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  userId: string,
  openai: any
) {
  // Verify the user is authorized to use this feature
  const isAuthorized = await verifyAuthorizedDealParticipant(userId, dealId);
  if (!isAuthorized) {
    throw new Error("You are not authorized to use the Smart Contract Assistant feature for this deal");
  }
  
  // Fetch document content
  let documentContent: string;
  try {
    documentContent = await fetchDocumentContent(dealId, documentId, documentVersionId);
  } catch (error) {
    console.error("Error fetching document content:", error);
    throw new Error(`Failed to retrieve document content: ${error.message}`);
  }

  if (!documentContent || documentContent.trim() === "") {
    throw new Error("No document content available for analysis");
  }

  // Limit content length for API efficiency
  const maxContentLength = 15000; // Adjusted for contract analysis
  const trimmedContent = documentContent.length > maxContentLength 
    ? documentContent.substring(0, maxContentLength) + "... [content truncated due to length]" 
    : documentContent;

  // Call OpenAI for contract summarization
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using the most suitable model for contract analysis
    messages: [
      {
        role: "system",
        content: `You are a legal assistant. Summarize the key terms and sections of the following contract document in simple, non-legal terms.
        Then, list the parties involved, the contract type (e.g., Asset Purchase Agreement, Lease Agreement), any key obligations, timelines, termination rules, and liabilities explicitly mentioned.
        
        Answer ONLY using what is explicitly stated in the document.
        Do NOT invent information or speculate.
        Do NOT provide legal advice; state that you are an informational tool.
        If the answer is NOT explicitly available, state 'I cannot find that information in the provided text.'
        Highlight any unclear or ambiguous language if found.`
      },
      {
        role: "user",
        content: `Contract Document Content:
        ${trimmedContent}
        
        Provide the summary and key points in a clear, structured format.`
      }
    ],
    temperature: 0.3, // Lower temperature for more factual summaries
    max_tokens: 1500  // Adjusted based on desired summary length
  });

  const summaryContent = response.choices[0].message.content;
  
  // Parse the response to extract structured information
  // This is a simple extraction method - in production you might want to use a more robust approach
  const parseResponse = (content: string) => {
    const sections = {
      summaryText: content,
      parties: [] as string[],
      contractType: "Not explicitly specified",
      keyObligations: [] as string[],
      timelines: [] as string[],
      terminationRules: [] as string[],
      liabilities: [] as string[]
    };
    
    // Try to extract sections based on common patterns in the AI's response
    // This is a basic implementation and might need refinement
    if (content.includes("Parties:") || content.includes("Parties involved:")) {
      const partiesMatch = content.match(/Parties(?:\sinvolved)?:([^\n]*(?:\n[^\n]*)*?)(?:\n\n|\n[A-Z])/i);
      if (partiesMatch && partiesMatch[1]) {
        sections.parties = partiesMatch[1].split(/\n/).filter(p => p.trim()).map(p => p.trim());
      }
    }
    
    if (content.includes("Contract Type:") || content.includes("Type of Contract:")) {
      const typeMatch = content.match(/(?:Contract Type|Type of Contract):([^\n]*)/i);
      if (typeMatch && typeMatch[1]) {
        sections.contractType = typeMatch[1].trim();
      }
    }
    
    // Extract other sections similarly...
    
    return sections;
  };
  
  const parsedSummary = parseResponse(summaryContent);

  return {
    ...parsedSummary,
    disclaimer: "This tool provides general legal information, not legal advice. Always consult a lawyer for final review."
  };
}
