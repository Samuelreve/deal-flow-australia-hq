
import { handleExplainClause } from "./explain-clause.ts";
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handle request to summarize a smart contract
 */
export async function handleSummarizeContract(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  openai: any
) {
  if (!documentId || !documentVersionId) {
    throw new Error("Document ID and version ID are required for contract summarization");
  }

  // Fetch document content from storage
  let documentContent;
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
  const maxContentLength = 12000; // Approximate token limit for GPT models
  const trimmedContent = documentContent.length > maxContentLength 
    ? documentContent.substring(0, maxContentLength) + "... [content truncated due to length]" 
    : documentContent;

  // Construct the prompt for contract summary
  const prompt = `Analyze the following legal contract and provide a comprehensive summary. Focus on:
  
  1. Identifying the parties involved
  2. The main purpose of the contract 
  3. Key obligations for each party
  4. Important dates and deadlines
  5. Any significant conditions or contingencies
  6. Termination conditions
  7. Governing law
  
  Respond with a well-structured summary that would be helpful for a business person reviewing this contract.
  
  Contract Content:
  ${trimmedContent}`;

  // Call OpenAI for contract summary
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using a more efficient model
    messages: [
      {
        role: "system",
        content: "You are a legal assistant specializing in contract analysis. Provide clear, accurate summaries focusing on key business and legal aspects without giving legal advice."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3, // Lower temperature for more factual analysis
    max_tokens: 1500  // Adjust based on desired summary length
  });

  return {
    summary: response.choices[0].message.content,
    disclaimer: "This contract summary is AI-generated and provided for informational purposes only. It is not legal advice and should be reviewed by qualified legal professionals before making decisions."
  };
}

/**
 * Handle request to explain a specific clause from a contract
 */
export async function handleExplainContractClause(
  clauseText: string,
  documentId: string,
  documentVersionId: string,
  dealId: string,
  openai: any
) {
  if (!clauseText || clauseText.trim() === "") {
    throw new Error("Clause text is required for explanation");
  }
  
  // We can leverage the existing explain clause function
  // But customize the prompt for contract-specific explanation
  const customPrompt = `You are a legal assistant specialized in contract analysis. 
  Explain the following contract clause in plain language that a business person without legal training can understand.
  Identify any potential issues, ambiguities, or important implications of this clause.
  
  Contract Clause:
  ${clauseText}`;

  const result = await handleExplainClause(clauseText, customPrompt, openai);
  
  return {
    ...result,
    disclaimer: "This explanation is AI-generated and provided for informational purposes only. It is not legal advice and should be reviewed by qualified legal professionals before making decisions."
  };
}
