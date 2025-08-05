
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function verifyAuthorizedDealParticipant(
  supabaseClient: any,
  userId: string,
  dealId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('deal_participants')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('Error verifying deal participant:', error);
    return false;
  }
}

export async function summarizeContractOperation(
  openai: any,
  content: string,
  documentId?: string,
  userId?: string
) {
  try {
    // First, determine if this is a contract or non-contract document
    const classificationPrompt = `Analyze the following document and determine if it is a contract/legal agreement or another type of document. Respond with only "CONTRACT" or "NON-CONTRACT":

${content.substring(0, 2000)}`;

    const classificationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a document classifier. Respond with only 'CONTRACT' or 'NON-CONTRACT'." },
        { role: "user", content: classificationPrompt }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const documentType = classificationResponse.choices[0]?.message?.content?.trim() || "NON-CONTRACT";

    if (documentType === "CONTRACT") {
      // Use contract-specific analysis with strict formatting rules
      const contractPrompt = `Analyze this contract and provide a professional summary. Use only plain text with clear sections and simple formatting.

${content.substring(0, 8000)}

Provide EXACTLY this structure using simple text headings (no special characters):

CONTRACT TYPE AND PURPOSE
Brief description of what type of contract this is and its main purpose.

KEY PARTIES
List the main parties and their roles.

MAIN TERMS AND CONDITIONS  
Summarize the most important terms and obligations.

FINANCIAL TERMS
Detail any payments, pricing, or financial obligations.

KEY DATES AND DEADLINES
Important dates, deadlines, or time periods.

TERMINATION CONDITIONS
How and when the contract can be terminated.

POTENTIAL RISKS OR CONCERNS
Any risks, ambiguous clauses, or areas of concern.

Keep each section to 2-3 sentences maximum. Use clear, simple language.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a legal document analyst. Provide clear, structured analysis using only plain text. Never use markdown, asterisks, hash symbols, or special formatting. Keep responses concise and professional." },
          { role: "user", content: contractPrompt }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const analysis = response.choices[0]?.message?.content || "Could not analyze the contract.";
      
      return {
        summary: analysis + "\n\nDISCLAIMER: This AI-generated analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance.",
        documentType: "CONTRACT"
      };

    } else {
      // Use general document analysis with strict formatting rules
      const generalPrompt = `Analyze this document and provide a summary using only plain text with clear sections.

${content.substring(0, 8000)}

Provide EXACTLY this structure using simple text headings (no special characters):

DOCUMENT TYPE
Identify what type of document this is.

MAIN PURPOSE
Explain the primary purpose or objective.

KEY INFORMATION
Summarize the most important information or content.

MAIN SECTIONS OR TOPICS
Overview of the major sections or topics covered.

IMPORTANT DETAILS
Any specific details, numbers, dates, or requirements.

RECOMMENDATIONS OR NEXT STEPS
If applicable, any suggested actions or next steps.

Keep each section to 2-3 sentences maximum. Use clear, simple language.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a document analyst. Provide clear, structured analysis using only plain text. Never use markdown, asterisks, hash symbols, or special formatting. Keep responses concise and professional." },
          { role: "user", content: generalPrompt }
        ],
        temperature: 0.1,
        max_tokens: 600
      });

      const analysis = response.choices[0]?.message?.content || "Could not analyze the document.";
      
      return {
        summary: analysis + "\n\nNOTE: This is an AI-generated summary for informational purposes. Please review the original document for complete and accurate information.",
        documentType: "NON-CONTRACT"
      };
    }

  } catch (error) {
    console.error('Error in summarize contract operation:', error);
    throw new Error('Failed to summarize contract');
  }
}

export async function handleSummarizeContract(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  userId: string,
  openai: any
) {
  try {
    // For now, we'll use the existing summarizeContractOperation
    // In a real implementation, you might want to fetch the contract content from the document
    const result = await summarizeContractOperation(
      openai,
      "Contract content would be fetched here", // This should be the actual contract content
      documentId,
      userId
    );

    return {
      summary: result.summary,
      documentType: result.documentType
    };
  } catch (error) {
    console.error('Error in handleSummarizeContract:', error);
    throw new Error('Failed to summarize contract');
  }
}
