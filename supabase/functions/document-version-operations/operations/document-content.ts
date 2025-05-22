
/**
 * Get the content of a document version
 */
export async function getDocumentContent(supabase: any, dealId: string, versionId: string): Promise<string> {
  try {
    console.log(`Retrieving document content for version ${versionId} in deal ${dealId}`);
    
    // Get version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('storage_path, document_id')
      .eq('id', versionId)
      .single();
    
    if (versionError || !version) {
      console.error("Version retrieval error:", versionError?.message || "Version not found");
      throw new Error('Document version not found');
    }
    
    console.log(`Found version with document_id: ${version.document_id} and storage_path: ${version.storage_path}`);
    
    // Verify that the document belongs to the given deal
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', version.document_id)
      .eq('deal_id', dealId)
      .single();
      
    if (docError || !document) {
      console.error("Document verification error:", docError?.message || "Document not found or doesn't belong to deal");
      throw new Error('Document not found or does not belong to this deal');
    }
    
    // Create a signed URL to download the file
    const { data: urlData, error: urlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${version.storage_path}`, 60);
    
    if (urlError || !urlData?.signedUrl) {
      console.error("Signed URL creation error:", urlError?.message || "Failed to create URL");
      throw new Error('Failed to create signed URL');
    }
    
    // Download the file content
    const response = await fetch(urlData.signedUrl);
    if (!response.ok) {
      console.error("File download error:", response.statusText);
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // For simplicity, we're treating all files as text
    // In a production environment, you would handle different file types (PDF, DOCX, etc.)
    const content = await response.text();
    console.log(`Successfully retrieved content for version ${versionId}, length: ${content.length}`);
    return content;
  } catch (error) {
    console.error('Error retrieving document content:', error);
    throw error;
  }
}
