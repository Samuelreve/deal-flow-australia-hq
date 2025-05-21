
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handles the contract summary operation
 */
export async function handleSummarizeContract(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  userId: string,
  openai: any
) {
  if (!documentId || !documentVersionId) {
    throw new Error("Document ID and version ID are required for contract summarization");
  }

  // Fetch document content
  let documentContent;
  try {
    documentContent = await fetchDocumentContent(dealId, documentId, documentVersionId);
  } catch (error) {
    console.error("Error fetching document content:", error);
    throw new Error(`Failed to retrieve document content: ${error.message}`);
  }

  if (!documentContent || documentContent.trim() === "") {
    throw new Error("No document content available for summarization");
  }

  // Summarize with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a contract analysis assistant specialized in providing clear, accurate summaries of legal documents. Your summaries are concise but capture all key points. Use plain language where possible but maintain accuracy for technical terms."
      },
      {
        role: "user",
        content: `Please provide a comprehensive summary of the following contract document. Identify the main parties, key provisions, obligations, rights, timeframes, and any notable conditions or clauses:\n\n${documentContent.substring(0, 12000)}`
      }
    ],
    temperature: 0.3,
    max_tokens: 1500
  });

  return {
    summary: response.choices[0].message.content,
    disclaimer: "This summary is AI-generated and provided for informational purposes only. It should not be considered legal advice or a substitute for reading the full document."
  };
}

/**
 * Handles the contract clause explanation operation
 */
export async function handleExplainContractClause(
  dealId: string, 
  userId: string,
  clauseText: string,
  openai: any
) {
  if (!clauseText || clauseText.trim() === "") {
    throw new Error("No clause text provided for explanation");
  }

  // Analyze if the clause is ambiguous
  const ambiguityAnalysisResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a contract analysis assistant specialized in identifying ambiguity in legal clauses. Analyze the provided clause text and determine if it contains ambiguous language, inconsistencies, or vague terms that could lead to different interpretations."
      },
      {
        role: "user",
        content: `Analyze the following contract clause for ambiguity. Respond with JSON containing 'isAmbiguous' (boolean) and 'ambiguityExplanation' (string explaining why it's ambiguous, if applicable):\n\n${clauseText}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  // Parse ambiguity analysis
  const ambiguityAnalysis = JSON.parse(ambiguityAnalysisResponse.choices[0].message.content);

  // Get explanation for the clause
  const explanationResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a contract analysis assistant specialized in explaining legal clauses in clear, simple language. Provide explanations that are accurate but accessible to non-lawyers."
      },
      {
        role: "user",
        content: `Please explain the following contract clause in plain language, addressing its meaning, implications, and purpose:\n\n${clauseText}`
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  return {
    explanation: explanationResponse.choices[0].message.content,
    isAmbiguous: ambiguityAnalysis.isAmbiguous,
    ambiguityExplanation: ambiguityAnalysis.ambiguityExplanation || "",
    disclaimer: "This explanation is AI-generated and provided for informational purposes only. It should not be considered legal advice."
  };
}
