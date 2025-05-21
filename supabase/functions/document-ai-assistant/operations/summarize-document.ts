import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handler for summarizing documents using AI
 */
export async function handleSummarizeDocument(
  content: string | null,
  dealId: string,
  documentId: string,
  documentVersionId: string,
  openai: OpenAI
) {
  try {
    // If content is not provided, fetch it from storage
    let documentContent = content;
    if (!documentContent) {
      documentContent = await fetchDocumentContent(dealId, documentId, documentVersionId);
    }

    if (!documentContent || documentContent.length < 50) {
      throw new Error('Insufficient document content for summarization');
    }

    // Truncate content if too large
    const maxContentLength = 15000; // Adjust based on token limits
    const truncatedContent = documentContent.length > maxContentLength 
      ? documentContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : documentContent;

    // Construct OpenAI prompt for summarization
    const promptContent = `You are a legal document summarization assistant. Please provide a comprehensive summary of the following document:

${truncatedContent}

Your summary should include:
1. The main purpose of the document
2. Key parties involved and their roles
3. Important terms and conditions
4. Significant obligations for each party
5. Any notable deadlines or dates
6. Potential risks or areas of concern

Format your response in clear sections with headings. Be concise but thorough.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI legal assistant specializing in document summarization." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const summary = response.choices[0]?.message?.content || 'Failed to generate summary';
    
    // Return the summary with disclaimer
    return {
      summary,
      disclaimer: "This summary is AI-generated and provided for informational purposes only. It is not legal advice and may not capture all important details of the document. Always review the full document or consult a qualified professional."
    };
    
  } catch (error: any) {
    console.error('Error in handleSummarizeDocument:', error);
    throw error;
  }
}
