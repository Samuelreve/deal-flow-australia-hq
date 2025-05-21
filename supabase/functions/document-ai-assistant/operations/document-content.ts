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
      .select('text_content, file_path')
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
    if (version.text_content) {
      return version.text_content;
    }
    
    // Otherwise, fetch from storage
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
      
      // Convert to text
      const text = await fileData.text();
      return text;
    }
    
    throw new Error("No content available for document");
  } catch (error) {
    console.error("Error fetching document content:", error);
    throw error;
  }
}
