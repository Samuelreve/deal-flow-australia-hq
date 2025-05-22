
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
    // First verify the document belongs to the specified deal
    const supabaseClient = supabase || createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    console.log(`Starting version comparison for deal ${dealId}, document ${documentId}, versions ${currentVersionId} and ${previousVersionId}`);
    
    // If documentId is "auto", look it up from the version
    if (documentId === "auto") {
      const { data: versionData, error: versionError } = await supabaseClient
        .from('document_versions')
        .select('document_id')
        .eq('id', currentVersionId)
        .single();
      
      if (versionError || !versionData) {
        console.error("Failed to auto-resolve document ID:", versionError?.message || "Version not found");
        throw new Error("Could not determine document ID from version");
      }
      
      documentId = versionData.document_id;
      console.log(`Auto-resolved document ID: ${documentId} from version ${currentVersionId}`);
    }
    
    // Verify document exists and belongs to this deal
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .single();
    
    if (docError || !document) {
      console.error("Document verification error:", docError?.message || "Document not found");
      throw new Error("Document not found or does not belong to this deal");
    }

    // Verify both versions exist and belong to this document
    const { data: versions, error: versionError } = await supabaseClient
      .from('document_versions')
      .select('id')
      .eq('document_id', documentId)
      .in('id', [currentVersionId, previousVersionId]);
    
    if (versionError) {
      console.error("Version query error:", versionError?.message);
      throw new Error("Error querying document versions");
    }
    
    if (!versions || versions.length !== 2) {
      console.error(`Expected 2 versions, found ${versions?.length || 0}`);
      throw new Error("One or both document versions not found");
    }
    
    console.log(`Starting version content retrieval for document ${documentId}`);

    // Get the content for both versions
    const currentContent = await fetchDocumentContent(dealId, documentId, currentVersionId);
    const previousContent = await fetchDocumentContent(dealId, documentId, previousVersionId);
    
    if (!currentContent || !previousContent) {
      console.error("Failed to retrieve document content", { 
        hasCurrentContent: !!currentContent, 
        hasPreviousContent: !!previousContent 
      });
      throw new Error("Failed to retrieve document versions content");
    }
    
    console.log("Successfully fetched content for both versions");
    
    // Truncate content if too large to fit OpenAI's context window
    const maxContentLength = 10000;
    
    const truncatedCurrentContent = currentContent.length > maxContentLength 
      ? currentContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : currentContent;
      
    const truncatedPreviousContent = previousContent.length > maxContentLength 
      ? previousContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : previousContent;
    
    console.log(`Current content length: ${currentContent.length}, Previous content length: ${previousContent.length}`);
    
    // If content is identical, return early
    if (currentContent === previousContent) {
      return {
        summary: "No changes detected. The document versions appear to be identical.",
        disclaimer: "This is an AI-generated assessment. The document versions appear to have the same text content."
      };
    }
    
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

    console.log("Sending version comparison request to OpenAI");

    // Call OpenAI API with retries
    let attempts = 0;
    const maxAttempts = 3;
    let response;
    
    while (attempts < maxAttempts) {
      try {
        response = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Using smaller model for faster response
          messages: [
            { role: "system", content: "You are an AI document version comparison specialist." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        });
        break; // Break the loop if successful
      } catch (openaiError) {
        attempts++;
        console.error(`OpenAI API error (attempt ${attempts}/${maxAttempts}):`, openaiError);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate version comparison after ${maxAttempts} attempts: ${openaiError.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }

    if (!response || !response.choices[0]?.message?.content) {
      throw new Error("Failed to generate version comparison summary");
    }

    const summary = response.choices[0].message.content;
    console.log("Successfully generated version comparison summary");
    
    // Store the analysis result in document_analyses table for future reference
    try {
      await supabaseClient
        .from('document_analyses')
        .insert({
          document_id: documentId,
          document_version_id: currentVersionId,
          analysis_type: 'version_comparison',
          analysis_content: {
            current_version_id: currentVersionId,
            previous_version_id: previousVersionId,
            summary: summary
          }
        });
      console.log("Successfully saved version comparison analysis to database");
    } catch (saveError) {
      console.warn("Failed to save version comparison analysis:", saveError);
      // Continue anyway as this is non-critical
    }
    
    return {
      summary,
      disclaimer: "This is an AI-generated summary of changes between document versions. It may not identify all changes and should be reviewed by a human for accuracy and completeness."
    };
  } catch (error) {
    console.error('Error in handleSummarizeVersionChanges:', error);
    throw error;
  }
}
