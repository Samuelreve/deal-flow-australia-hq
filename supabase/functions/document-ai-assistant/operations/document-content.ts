import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Fetch document content from storage
 */
export async function fetchDocumentContent(
  dealId: string,
  documentId: string,
  documentVersionId: string
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not available");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get document version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('text_content, file_path, mime_type')
      .eq('id', documentVersionId)
      .eq('document_id', documentId)
      .single();
      
    if (versionError) {
      throw versionError;
    }
    
    if (!version) {
      throw new Error("Document version not found");
    }
    
    // If text content is available directly, use it
    if (version.text_content && version.text_content.trim().length > 0) {
      return version.text_content;
    }
    
    // Otherwise, fetch from storage and attempt text extraction
    if (version.file_path) {
      // Get the document to find the bucket
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_bucket')
        .eq('id', documentId)
        .single();
        
      if (docError) {
        throw docError;
      }
      
      if (!document || !document.storage_bucket) {
        throw new Error("Document or storage bucket not found");
      }
      
      // Download file
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from(document.storage_bucket)
        .download(version.file_path);
        
      if (fileError) {
        throw fileError;
      }

      // Extract text based on mime type
      const text = await extractTextFromFile(fileData, version.mime_type);
      
      // Optionally, update the document version with extracted text
      // This would save processing time for future analyses
      try {
        await supabase
          .from('document_versions')
          .update({ text_content: text })
          .eq('id', documentVersionId);
      } catch (updateError) {
        console.warn("Failed to update text_content for future use:", updateError);
        // Continue anyway, since we have the text already
      }
      
      return text;
    }
    
    throw new Error("No content available for document");
  } catch (error) {
    console.error("Error fetching document content:", error);
    throw error;
  }
}

/**
 * Extract text from file data based on mime type
 */
async function extractTextFromFile(fileData: Blob, mimeType: string): Promise<string> {
  // Handle text-based files
  if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/html') {
    return await fileData.text();
  }

  // Handle PDF files - basic extraction approach
  if (mimeType === 'application/pdf') {
    // For now, return a placeholder when we encounter PDF files
    // In a production environment, you would use a PDF parsing library
    // or invoke a separate service to handle PDF text extraction
    console.warn("PDF text extraction not fully implemented. Consider using a dedicated PDF parsing service.");
    
    // Return raw text for small PDFs that might be text-based
    try {
      const rawText = await fileData.text();
      // Check if it looks like text and not binary
      if (rawText.length > 100 && /^[\x20-\x7E\s]+$/.test(rawText.substring(0, 100))) {
        return rawText;
      }
    } catch (e) {
      console.error("Error trying text extraction from PDF:", e);
    }
    
    return "[This is a PDF document. Text extraction requires a dedicated PDF parsing library. Consider adding a PDF parsing solution to the Edge Function or preprocessing documents to extract text before upload.]";
  }

  // Handle DOCX files - basic extraction approach
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For now, return a placeholder when we encounter DOCX files
    console.warn("DOCX text extraction not fully implemented. Consider using a dedicated DOCX parsing service.");
    
    return "[This is a DOCX document. Text extraction requires a dedicated DOCX parsing library. Consider adding a DOCX parsing solution to the Edge Function or preprocessing documents to extract text before upload.]";
  }

  // Handle other common document types with basic extraction
  if (mimeType === 'application/rtf' || mimeType === 'text/rtf') {
    try {
      return await fileData.text(); // Basic extraction for RTF
    } catch (e) {
      console.error("Error extracting text from RTF:", e);
      return "[RTF document - text extraction limited]";
    }
  }

  // Default fallback for unsupported types
  console.warn(`Unsupported document type for text extraction: ${mimeType}`);
  return `[Document type ${mimeType} not supported for text extraction. Please convert to a supported format.]`;
}
