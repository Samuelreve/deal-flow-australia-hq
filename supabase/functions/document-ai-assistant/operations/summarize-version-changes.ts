
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Handler for summarizing changes between document versions using AI
 */
export async function handleSummarizeVersionChanges(
  dealId: string, 
  documentId: string,
  currentVersionId: string,
  previousVersionId: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createClient>
) {
  try {
    // 1. Fetch details for current version
    const { data: currentVersion, error: currentVersionError } = await supabase
      .from('document_versions')
      .select('storage_path, type')
      .eq('id', currentVersionId)
      .eq('document_id', documentId)
      .single();
    
    if (currentVersionError || !currentVersion) {
      throw new Error('Current document version not found or access denied.');
    }

    // 2. Fetch details for previous version
    const { data: previousVersion, error: previousVersionError } = await supabase
      .from('document_versions')
      .select('storage_path, type')
      .eq('id', previousVersionId)
      .eq('document_id', documentId)
      .single();
    
    if (previousVersionError || !previousVersion) {
      throw new Error('Previous document version not found or access denied.');
    }

    // 3. Create signed URLs to access the files
    const { data: currentUrlData, error: currentUrlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${currentVersion.storage_path}`, 60);
    
    if (currentUrlError || !currentUrlData?.signedUrl) {
      throw new Error('Failed to access current document version.');
    }
    
    const { data: previousUrlData, error: previousUrlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${previousVersion.storage_path}`, 60);
    
    if (previousUrlError || !previousUrlData?.signedUrl) {
      throw new Error('Failed to access previous document version.');
    }

    // 4. Download the file content
    const currentResponse = await fetch(currentUrlData.signedUrl);
    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current version: ${currentResponse.statusText}`);
    }
    const currentContent = await currentResponse.text();
    
    const previousResponse = await fetch(previousUrlData.signedUrl);
    if (!previousResponse.ok) {
      throw new Error(`Failed to fetch previous version: ${previousResponse.statusText}`);
    }
    const previousContent = await previousResponse.text();

    // 5. Ensure we have sufficient content to compare
    if (!currentContent || currentContent.length < 10 || !previousContent || previousContent.length < 10) {
      throw new Error('Could not extract sufficient text from one or both documents for comparison.');
    }

    // 6. Prepare content for OpenAI (truncate if too large)
    const maxContentLength = 12000; // Adjust based on token limits
    const truncatedPrevious = previousContent.length > maxContentLength 
      ? previousContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : previousContent;
    
    const truncatedCurrent = currentContent.length > maxContentLength 
      ? currentContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : currentContent;

    // 7. Construct OpenAI prompt for comparison summary
    const promptContent = `You are a legal document comparison assistant. Your task is to summarize the key changes and differences between two versions of a document. Focus on significant additions, deletions, or modifications to clauses, terms, or obligations.

Previous Document Version Content:
${truncatedPrevious}

---

Current Document Version Content:
${truncatedCurrent}

---

Provide a concise summary of the changes in bullet points. Highlight any new risks, significant altered obligations, or important new clauses.

Important Rules:
1. Base your summary ONLY on the provided text. Do not invent information.
2. Be concise and professional.
3. Do NOT provide legal or financial advice.
4. If no significant changes are detected, state 'No significant changes detected.'`;

    // 8. Call OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use an appropriate model
      messages: [
        { role: "system", content: "You are an AI document comparison assistant specializing in legal and business documents." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const summary = response.choices[0]?.message?.content || 'Failed to generate summary';
    
    // 9. Return the summary with disclaimer
    return {
      summary,
      disclaimer: "This AI-generated summary is provided for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for interpretation of legal documents."
    };
    
  } catch (error: any) {
    console.error('Error in handleSummarizeVersionChanges:', error);
    throw error;
  }
}
