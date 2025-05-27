
export async function handleSummarizeDocument(
  content: string,
  dealId: string,
  documentId: string,
  documentVersionId: string,
  openai: any
) {
  try {
    // For contract analysis, content is provided directly
    if (dealId === 'contract-analysis') {
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
        const contractPrompt = `Analyze this contract and provide a comprehensive summary in clean, plain text format. Do not use markdown, bullet points, hashtags, asterisks, or any special formatting.

${content}

Provide your analysis in this exact structure:

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

Keep each section concise but comprehensive. Use plain English and avoid legal jargon where possible. Do not use any markdown formatting, hashtags, or special characters.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a legal document analysis expert. Provide clear, structured analysis in plain text format without any markdown, hashtags, bullet points, or special formatting. Use only plain text with clear section headers." },
            { role: "user", content: contractPrompt }
          ],
          temperature: 0.2,
          max_tokens: 1500
        });

        const summary = response.choices[0]?.message?.content || "Could not analyze the contract.";

        return {
          summary: summary + "\n\nDISCLAIMER: This AI-generated analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance.",
          documentType: "CONTRACT"
        };

      } else {
        // Use general document analysis
        const generalPrompt = `Analyze this document and provide a summary in clean, plain text format. Do not use markdown, bullet points, hashtags, asterisks, or any special formatting.

${content}

Provide your analysis in this exact structure:

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

Keep the summary clear and focused on the most relevant information. Do not use any markdown formatting, hashtags, or special characters.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a document analysis expert. Provide clear, structured analysis in plain text format without any markdown, hashtags, bullet points, or special formatting. Use only plain text with clear section headers." },
            { role: "user", content: generalPrompt }
          ],
          temperature: 0.2,
          max_tokens: 1200
        });

        const summary = response.choices[0]?.message?.content || "Could not analyze the document.";

        return {
          summary: summary + "\n\nNOTE: This is an AI-generated summary for informational purposes. Please review the original document for complete and accurate information.",
          documentType: "NON-CONTRACT"
        };
      }
    }

    // For regular deals, implement actual document fetching here
    return {
      summary: "Document summary functionality for regular deals not yet implemented.",
      disclaimer: "This feature is under development."
    };
  } catch (error) {
    console.error('Error in handleSummarizeDocument:', error);
    throw new Error('Failed to summarize document');
  }
}
