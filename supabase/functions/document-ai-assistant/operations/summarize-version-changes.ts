
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handler for summarizing changes between document versions
 */
export async function handleSummarizeVersionChanges(
  dealId: string,
  documentId: string,
  currentVersionId: string,
  previousVersionId: string,
  openai: OpenAI,
  supabase?: ReturnType<typeof createClient>
) {
  try {
    // Get the content for both versions
    const currentContent = await fetchDocumentContent(dealId, documentId, currentVersionId);
    const previousContent = await fetchDocumentContent(dealId, documentId, previousVersionId);
    
    if (!currentContent || !previousContent) {
      throw new Error("Failed to retrieve document versions content");
    }
    
    // Truncate content if too large to fit OpenAI's context window
    const maxContentLength = 10000;
    
    const truncatedCurrentContent = currentContent.length > maxContentLength 
      ? currentContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : currentContent;
      
    const truncatedPreviousContent = previousContent.length > maxContentLength 
      ? previousContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : previousContent;
    
    // Create prompt for AI to analyze changes
    const prompt = `You are a document version comparison assistant. Your task is to identify and summarize the key changes between two versions of a document.

Previous Version:
${truncatedPreviousContent}

Current Version:
${truncatedCurrentContent}

Please provide:
1. A concise summary of the main changes between versions
2. A list of key additions, deletions, or modifications
3. Highlight any significant changes that might have legal or business implications

Be factual and focused on the actual changes. If the changes are minimal or primarily formatting, indicate that as well.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI document version comparison specialist." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const summary = response.choices[0]?.message?.content || 'Failed to generate version comparison summary';
    
    return {
      summary,
      disclaimer: "This is an AI-generated summary of changes between document versions. It may not identify all changes and should be reviewed by a human for accuracy and completeness."
    };
  } catch (error) {
    console.error('Error in handleSummarizeVersionChanges:', error);
    throw error;
  }
}
