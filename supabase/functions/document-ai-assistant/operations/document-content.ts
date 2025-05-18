
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Fetch document content from Supabase Storage
 */
export async function fetchDocumentContent(dealId: string, documentId: string, documentVersionId: string) {
  // Get Supabase admin client
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // First, get the storage path for the document version
    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('document_versions')
      .select('storage_path, document_id')
      .eq('id', documentVersionId)
      .eq('document_id', documentId)
      .single();
    
    if (versionError || !versionData) {
      throw new Error(`Error fetching document version: ${versionError?.message || "Version not found"}`);
    }
    
    // Verify this document belongs to the specified deal
    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('documents')
      .select('deal_id')
      .eq('id', documentId)
      .single();
    
    if (documentError || !documentData) {
      throw new Error(`Error fetching document: ${documentError?.message || "Document not found"}`);
    }
    
    if (documentData.deal_id !== dealId) {
      throw new Error("Document does not belong to specified deal");
    }
    
    // Now download the file from storage
    const storagePath = `${dealId}/${versionData.storage_path}`;
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from('deal-documents')
      .download(storagePath);
    
    if (fileError || !fileData) {
      throw new Error(`Error downloading document from storage: ${fileError?.message}`);
    }
    
    // Convert Blob to text
    const text = await fileData.text();
    return text;
  } catch (error) {
    console.error(`Error in fetchDocumentContent for deal ${dealId}, document ${documentId}:`, error);
    throw error;
  }
}
