
import { verifyAuthorizedDealParticipant } from "./summarize-contract.ts";

/**
 * Handle contract clause explanation operation
 */
export async function handleExplainContractClause(
  dealId: string,
  userId: string,
  selectedText: string,
  openai: any
) {
  // Verify the user is authorized to use this feature
  const isAuthorized = await verifyAuthorizedDealParticipant(userId, dealId);
  if (!isAuthorized) {
    throw new Error("You are not authorized to use the Smart Contract Assistant feature for this deal");
  }
  
  if (!selectedText || selectedText.trim() === "") {
    throw new Error("No clause text provided for explanation");
  }

  // Call OpenAI for clause explanation
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using the most suitable model for legal analysis
    messages: [
      {
        role: "system",
        content: `You are a legal assistant. Explain the following legal clause from a contract in plain English, avoiding legal jargon. Assume the user is a business owner or buyer who is not a lawyer.
        
        Answer ONLY using what is explicitly stated in the clause.
        Do NOT invent information or speculate.
        Do NOT provide legal advice; state that you are an informational tool.
        If the clause is ambiguous, mention that it could be interpreted in multiple ways and advise consulting a lawyer.
        Highlight any unclear or ambiguous language if found.`
      },
      {
        role: "user",
        content: `Legal Clause to Explain:
        ${selectedText}
        
        Provide the explanation concisely and directly.`
      }
    ],
    temperature: 0.3, // Lower temperature for more factual explanation
    max_tokens: 1000  // Adjusted based on desired explanation length
  });

  const explanationContent = response.choices[0].message.content;
  
  // Determine if the clause was flagged as ambiguous
  const isAmbiguous = explanationContent.toLowerCase().includes("ambiguous") || 
                     explanationContent.toLowerCase().includes("ambiguity") || 
                     explanationContent.toLowerCase().includes("interpret") || 
                     explanationContent.toLowerCase().includes("multiple ways") ||
                     explanationContent.toLowerCase().includes("unclear");
  
  // Extract ambiguity explanation if present
  let ambiguityExplanation = null;
  if (isAmbiguous) {
    const ambiguityMatch = explanationContent.match(/(?:ambiguous|ambiguity|unclear|interpret|multiple ways)([^.]*.)/i);
    if (ambiguityMatch && ambiguityMatch[0]) {
      ambiguityExplanation = ambiguityMatch[0].trim();
    }
  }

  return {
    explanation: explanationContent,
    isAmbiguous: isAmbiguous,
    ambiguityExplanation: ambiguityExplanation || undefined,
    disclaimer: "This tool provides general legal information, not legal advice. Always consult a lawyer for final review of any contract clause."
  };
}
