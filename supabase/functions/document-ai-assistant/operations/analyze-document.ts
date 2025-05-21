
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handle document analysis operation
 */
export async function handleAnalyzeDocument(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  analysisType: string,
  openai: any
) {
  if (!documentId || !documentVersionId) {
    throw new Error("Document ID and version ID are required for document analysis");
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

  // Construct the prompt based on analysis type
  let prompt = "";
  let responseFormat = { type: "json_object" };

  switch (analysisType) {
    case "key_clauses":
      prompt = `Analyze the following legal document and extract the most important clauses related to a business deal. 
      List each key clause by its heading or first few words, and provide a very brief, one-sentence summary of its purpose. 
      Output as a JSON array of objects with 'heading' (string) and 'summary' (string).

      Document Content:
      ${trimmedContent}`;
      break;
      
    case "risk_identification":
      prompt = `Review the following contract text for potential legal or business risks. 
      Identify any unusual clauses, liabilities, or unfavorable terms. List each risk with a brief explanation and its location (e.g., 'Clause X'). 
      Output as a JSON array of objects with 'risk' (string), 'location' (string), and 'explanation' (string).

      Contract Content:
      ${trimmedContent}`;
      break;
      
    case "legal_compliance":
      prompt = `Analyze the following document for potential legal compliance considerations. 
      Identify areas that may require attention from a compliance perspective. Explain each consideration briefly.
      Output as a JSON object with 'summary' (string) and 'considerations' (array of objects with 'area' (string) and 'explanation' (string)).
      
      Document Content:
      ${trimmedContent}`;
      break;
      
    case "obligations_analysis":
      prompt = `Extract all obligations, commitments, and important dates from the following document.
      For each obligation, identify who is responsible, what they must do, and when they must do it (if specified).
      Output as a JSON object with 'summary' (string) and 'obligations' (array of objects with 'party' (string), 'obligation' (string), 'deadline' (string or null), and 'section' (string)).
      
      Document Content:
      ${trimmedContent}`;
      break;
      
    case "financial_terms":
      prompt = `Analyze the following document and extract all financial terms, monetary obligations, payment schedules, and financial conditions.
      Output as a JSON object with 'summary' (string) and 'terms' (array of objects with 'category' (string), 'description' (string), 'amount' (string or null), and 'section' (string)).
      
      Document Content:
      ${trimmedContent}`;
      break;
      
    case "technical_specification":
      prompt = `Analyze the following document for technical specifications, requirements, and standards.
      Extract and explain any technical details, specifications, or requirements mentioned.
      Output as a JSON object with 'summary' (string) and 'specifications' (array of objects with 'category' (string), 'description' (string), and 'section' (string)).
      
      Document Content:
      ${trimmedContent}`;
      break;
      
    default:
      prompt = `Analyze the following document and provide a comprehensive summary highlighting the most important aspects for a business deal.
      Structure your response as a JSON object with 'summary' (string) and 'key_points' (array of strings).

      Document Content:
      ${trimmedContent}`;
  }

  // Call OpenAI for analysis
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using a more efficient model
    messages: [
      {
        role: "system",
        content: "You are a document analysis assistant specialized in business and legal documents. Provide clear, accurate analysis focusing on key legal and business aspects. Format your response in JSON as requested."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: responseFormat,
    temperature: 0.2, // Lower temperature for more factual analysis
    max_tokens: 1000  // Adjust based on desired analysis length
  });

  // Parse the JSON response
  let analysisContent;
  try {
    analysisContent = JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    analysisContent = { error: "Failed to parse analysis result", raw: response.choices[0].message.content };
  }

  return {
    analysis: {
      type: analysisType,
      content: analysisContent
    },
    disclaimer: "This analysis is AI-generated and provided for informational purposes only. It is not legal or professional advice and should be reviewed by qualified professionals."
  };
}
