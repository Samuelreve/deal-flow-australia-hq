
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Text extractor service configuration
const TEXT_EXTRACTOR_API_KEY = Deno.env.get('TEXT_EXTRACTOR_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';

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

      // Extract text using our text-extractor service
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
 * Extract text from file using the text-extractor service
 */
async function extractTextFromFile(fileData: Blob, mimeType: string): Promise<string> {
  try {
    // Simple text-based files - we can extract directly
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/html') {
      return await fileData.text();
    }
    
    // For complex file types (PDF, DOCX, etc), use the text-extractor service
    const fileBase64 = await blobToBase64(fileData);
    
    // Call our text-extractor Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/text-extractor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEXT_EXTRACTOR_API_KEY}`
      },
      body: JSON.stringify({ fileBase64, mimeType })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Text extraction service error: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Text extraction failed");
    }
    
    return result.text;
  } catch (error) {
    console.error("Error in extractTextFromFile:", error);
    
    // Fallback handling based on mime type
    if (mimeType === 'application/pdf') {
      return "[This is a PDF document. Text extraction requires specialized PDF parsing. Consider preprocessing documents to extract text before upload.]";
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return "[This is a DOCX document. Text extraction requires specialized DOCX parsing. Consider preprocessing documents to extract text before upload.]";
    }
    
    throw error;
  }
}

/**
 * Convert a Blob to a base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
