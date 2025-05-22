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
    console.log(`Fetching document version ${documentVersionId} content`);
    
    // First verify the document belongs to the specified deal
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .single();
    
    if (docError) {
      console.error('Document verification error:', docError);
      throw new Error(`Document verification failed: ${docError.message}`);
    }
    
    if (!document) {
      throw new Error("Document not found or does not belong to this deal");
    }
    
    // Get document version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('text_content, file_path, mime_type, storage_path')
      .eq('id', documentVersionId)
      .eq('document_id', documentId)
      .single();
      
    if (versionError) {
      console.error('Version retrieval error:', versionError);
      throw new Error(`Version retrieval failed: ${versionError.message}`);
    }
    
    if (!version) {
      throw new Error("Document version not found");
    }
    
    // If text content is available directly, use it
    if (version.text_content && version.text_content.trim().length > 0) {
      console.log("Using cached text content from database");
      return version.text_content;
    }
    
    // Otherwise, fetch from storage and attempt text extraction
    const storagePath = version.storage_path || version.file_path;
    if (storagePath) {
      // Get the document to find the bucket
      const { data: documentWithBucket, error: docBucketError } = await supabase
        .from('documents')
        .select('storage_bucket')
        .eq('id', documentId)
        .single();
        
      if (docBucketError) {
        console.error('Error fetching document storage bucket:', docBucketError);
        throw new Error(`Failed to retrieve document storage information: ${docBucketError.message}`);
      }
      
      if (!documentWithBucket || !documentWithBucket.storage_bucket) {
        throw new Error("Document storage information not found");
      }
      
      const bucket = documentWithBucket.storage_bucket;
      console.log(`Downloading file from bucket "${bucket}", path "${storagePath}"`);
      
      // Download file
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from(bucket)
        .download(storagePath);
        
      if (fileError) {
        console.error('Storage download error:', fileError);
        throw new Error(`Failed to download document: ${fileError.message}`);
      }

      if (!fileData) {
        throw new Error("No file data returned from storage");
      }

      // Extract text using our text-extractor service
      const text = await extractTextFromFile(fileData, version.mime_type || '');
      
      // Optionally, update the document version with extracted text
      // This would save processing time for future analyses
      try {
        await supabase
          .from('document_versions')
          .update({ text_content: text })
          .eq('id', documentVersionId);
        console.log("Updated document_version with extracted text content");
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
    
    console.log(`Extracting text from ${mimeType} file using text-extractor service`);
    
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
      const errorText = await response.text();
      console.error(`Text extraction service error (${response.status}):`, errorText);
      
      throw new Error(`Text extraction service error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "Text extraction failed");
    }
    
    return result.text;
  } catch (error) {
    console.error("Error in extractTextFromFile:", error);
    
    // Fallback handling based on mime type
    if (mimeType.includes('pdf')) {
      return "[This is a PDF document. Text extraction requires specialized PDF parsing. Consider preprocessing documents to extract text before upload.]";
    } else if (mimeType.includes('word') || mimeType.includes('office')) {
      return "[This is a Microsoft Office document. Text extraction requires specialized document parsing. Consider preprocessing documents to extract text before upload.]";
    } else if (mimeType.includes('image')) {
      return "[This is an image file. Text extraction would require OCR capabilities. Consider preprocessing images to extract text before upload.]";
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
