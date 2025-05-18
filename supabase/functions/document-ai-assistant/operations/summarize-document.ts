
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handle document summarization operation
 */
export async function handleSummarizeDocument(
  content: string, 
  dealId?: string, 
  documentId?: string, 
  documentVersionId?: string,
  openai: any
) {
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
