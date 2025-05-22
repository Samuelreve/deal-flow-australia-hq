
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Analyzes a smart contract document to extract structured information
 */
export async function analyzeSmartContract(
  documentId: string,
  documentVersionId: string,
  content: string | null = null,
  openai: any
) {
  try {
    // Fetch document content if not provided
    let documentContent = content;
    if (!documentContent) {
      documentContent = await fetchDocumentContent("", documentId, documentVersionId);
    }

    if (!documentContent || documentContent.length < 100) {
      throw new Error("Insufficient document content for analysis");
    }

    // 1. First check if the document is a relevant business contract
    const isRelevant = await checkDocumentRelevance(documentContent, openai);
    
    if (!isRelevant) {
      return {
        success: false,
        message: "Document is not a relevant business contract or legal agreement. Please upload a valid contract.",
        analysis: null,
        disclaimer: "This AI tool is designed for business legal documents only."
      };
    }

    // 2. Extract key legal elements from the document
    const extractedData = await extractLegalElements(documentContent, openai);

    return {
      success: true,
      analysis: extractedData,
      disclaimer: "This AI-generated analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for specific guidance."
    };
  } catch (error) {
    console.error("Error in analyzeSmartContract:", error);
    throw new Error(`Failed to analyze smart contract: ${error.message}`);
  }
}

/**
 * Checks if a document is a relevant business contract or legal agreement
 */
async function checkDocumentRelevance(documentContent: string, openai: any): Promise<boolean> {
  // Limit content to first 2000 tokens to save cost
  const truncatedContent = documentContent.substring(0, 8000);
  
  const relevancePrompt = `Analyze the following document content. Determine if it is a business contract, agreement, lease, non-disclosure agreement (NDA), or any other type of formal legal document related to business transactions.

Document Content:
${truncatedContent}

Output ONLY 'true' if it is a relevant business legal document, otherwise output ONLY 'false'.`;

  const relevanceCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Use a cheaper model for quick classification
    messages: [
      { role: "system", content: "You are a document classifier. Output 'true' or 'false'." },
      { role: "user", content: relevancePrompt },
    ],
    max_tokens: 5, // Expecting only 'true' or 'false'
    temperature: 0, // Deterministic
  });

  const isRelevantString = relevanceCompletion.choices[0]?.message?.content?.trim().toLowerCase();
  return isRelevantString === 'true';
}

/**
 * Extracts key legal elements from a document
 */
async function extractLegalElements(documentContent: string, openai: any): Promise<any> {
  const extractionPrompt = `You are a legal assistant. Analyze the following business contract document.
Extract the following key legal elements and summarize their content concisely.
If a specific element is not found, state 'Not found'.

Contract Document Content:
${documentContent}

Output as a JSON object with the following keys:
{
  "contract_type": "[e.g., Asset Purchase Agreement, NDA, Lease, Service Agreement]",
  "parties_involved": "[List all parties by name/entity, e.g., 'Seller: ABC Pty Ltd, Buyer: XYZ Corp']",
  "key_obligations": "[Summarize main responsibilities of each party]",
  "timelines_and_dates": "[List key dates, deadlines, or durations (e.g., 'Effective Date: YYYY-MM-DD, Term: 5 years, Payment due within 30 days')]",
  "termination_rules": "[Summarize conditions for early termination, notice periods]",
  "liabilities_and_indemnities": "[Summarize clauses related to damages, indemnification, warranties]",
  "governing_law": "[State the governing law, e.g., 'Laws of Victoria, Australia']"
}

Important Rules:
1. Extract information ONLY from the provided 'Contract Document Content'.
2. Be concise.
3. Do NOT invent information or speculate.
4. If an element is not found, use 'Not found' for its value.
5. Do NOT provide legal advice.`;

  const analysisCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Using standard model that's widely available
    messages: [
      { role: "system", content: "You are a legal document analysis expert. Output valid JSON." },
      { role: "user", content: extractionPrompt },
    ],
    temperature: 0.1, // Low temperature for deterministic extraction
    max_tokens: 2000, // Adjust based on expected output length
  });

  const extractedDataString = analysisCompletion.choices[0]?.message?.content;
  
  try {
    // Extract JSON from the response if needed
    const jsonMatch = extractedDataString.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : extractedDataString;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing extracted data:", error);
    return {
      error: "Failed to parse extracted data",
      rawResponse: extractedDataString
    };
  }
}

/**
 * Explains a specific clause in a smart contract
 */
export async function explainSmartContractClause(
  documentId: string,
  documentVersionId: string,
  clauseText: string,
  openai: any
) {
  try {
    if (!clauseText || clauseText.trim().length < 10) {
      throw new Error("Insufficient clause text for explanation");
    }

    const explanationPrompt = `Analyze the following contract clause and provide a detailed explanation in plain language:

Contract Clause:
${clauseText}

Please explain:
1. What this clause means in simple terms
2. The obligations it creates for each party
3. Any potential legal implications
4. Common scenarios where this clause would be relevant`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using standard model that's widely available
      messages: [
        { role: "system", content: "You are a legal expert specializing in contract analysis. Explain legal concepts in plain language that non-lawyers can understand." },
        { role: "user", content: explanationPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return {
      explanation: response.choices[0].message.content,
      disclaimer: "This explanation is AI-generated and provided for informational purposes only. It should not be considered legal advice."
    };
  } catch (error) {
    console.error("Error in explainSmartContractClause:", error);
    throw new Error(`Failed to explain smart contract clause: ${error.message}`);
  }
}

/**
 * Summarizes a smart contract
 */
export async function summarizeSmartContract(
  documentId: string,
  documentVersionId: string,
  openai: any
) {
  try {
    // Fetch document content
    const documentContent = await fetchDocumentContent("", documentId, documentVersionId);
    
    if (!documentContent || documentContent.length < 100) {
      throw new Error("Insufficient document content for summarization");
    }

    const summaryPrompt = `Provide a comprehensive summary of the following legal document, focusing on:
1. Document type and purpose
2. Key parties involved
3. Main obligations for each party
4. Important dates and deadlines
5. Critical clauses and provisions
6. Potential risks or concerns

Document Content:
${documentContent}

Keep your summary concise but thorough, highlighting the most important aspects of the document.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using standard model that's widely available
      messages: [
        { role: "system", content: "You are a legal expert specializing in contract analysis. Summarize legal documents accurately and concisely." },
        { role: "user", content: summaryPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    return {
      summary: response.choices[0].message.content,
      disclaimer: "This summary is AI-generated and provided for informational purposes only. It should not be considered legal advice."
    };
  } catch (error) {
    console.error("Error in summarizeSmartContract:", error);
    throw new Error(`Failed to summarize smart contract: ${error.message}`);
  }
}
