
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Function to clean AI response and apply proper formatting
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  return text
    // Remove all markdown headers (### -> numbers)
    .replace(/^#{1,6}\s*(\d+\.?\s*.*?)$/gm, '$1')
    // Remove bold/italic formatting
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    // Remove extra asterisks and hash symbols
    .replace(/[*#]+/g, '')
    // Clean up bullet points and replace with dashes
    .replace(/^\s*[-•]\s*/gm, '- ')
    // Ensure proper indentation with numbers and dashes
    .replace(/^(\d+\.?\s*[A-Z][^:\n]*):?\s*$/gm, '$1')
    // Clean up any remaining special characters except numbers and dashes
    .replace(/[^\w\s\d.\-(),:;'"\/\n]/g, '')
    // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
      // Use contract-specific analysis
      const contractPrompt = `Analyze this contract and provide a comprehensive summary in clean, plain text format. STRICTLY avoid all markdown formatting including asterisks, hash symbols, bullet points, or any special characters. Use only plain text.

${content}

Provide your analysis in this exact structure using only plain text headings:

CONTRACT TYPE AND PURPOSE
[Identify the type of contract and its main purpose]

KEY PARTIES
[List the main parties involved and their roles]

MAIN TERMS AND CONDITIONS
[Summarize the most important terms, obligations, and conditions]

FINANCIAL TERMS
[Detail any payments, pricing, or financial obligations]

KEY DATES AND DEADLINES
[Important dates, deadlines, or time periods]

TERMINATION CONDITIONS
[How and when the contract can be terminated]

POTENTIAL RISKS OR CONCERNS
[Any risks, ambiguous clauses, or areas of concern]

Keep each section concise but comprehensive. Use plain English and avoid legal jargon where possible. Remember: NO asterisks, NO hash symbols, NO markdown formatting whatsoever.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a legal document analysis expert. Provide clear, structured analysis in plain text format without any markdown formatting. NEVER use asterisks, hash symbols, or any special characters. Use only plain text." },
          { role: "user", content: contractPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const analysis = cleanAIResponse(response.choices[0]?.message?.content || "Could not analyze the contract.");
      
      return {
        summary: analysis + "\n\nDISCLAIMER: This AI-generated analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance.",
        documentType: "CONTRACT"
      };

    } else {
      // Use general document analysis
      const generalPrompt = `Analyze this document and provide a summary in clean, plain text format. STRICTLY avoid all markdown formatting including asterisks, hash symbols, bullet points, or any special characters. Use only plain text.

${content}

Provide your analysis in this exact structure using only plain text headings:

DOCUMENT TYPE
[Identify what type of document this is]

MAIN PURPOSE
[Explain the primary purpose or objective of the document]

KEY INFORMATION
[Summarize the most important information, data, or content]

MAIN SECTIONS OR TOPICS
[Overview of the major sections or topics covered]

IMPORTANT DETAILS
[Any specific details, numbers, dates, or requirements that stand out]

RECOMMENDATIONS OR NEXT STEPS
[If applicable, any suggested actions or next steps]

Keep the summary clear and focused on the most relevant information. Remember: NO asterisks, NO hash symbols, NO markdown formatting whatsoever.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a document analysis expert. Provide clear, structured analysis in plain text format without any markdown formatting. NEVER use asterisks, hash symbols, or any special characters. Use only plain text." },
          { role: "user", content: generalPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      });

      const analysis = cleanAIResponse(response.choices[0]?.message?.content || "Could not analyze the document.");
      
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
