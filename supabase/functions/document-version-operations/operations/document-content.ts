
/**
 * Get the content of a document version
 */
export async function getDocumentContent(supabase: any, dealId: string, versionId: string): Promise<string> {
  try {
    // Get version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('storage_path, document_id')
      .eq('id', versionId)
      .single();
    
    if (versionError || !version) {
      throw new Error('Document version not found');
    }
    
    // Create a signed URL to download the file
    const { data: urlData, error: urlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${version.storage_path}`, 60);
    
    if (urlError || !urlData?.signedUrl) {
      throw new Error('Failed to create signed URL');
    }
    
    // Download the file content
    const response = await fetch(urlData.signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // For simplicity, we're treating all files as text
    // In a production environment, you would handle different file types (PDF, DOCX, etc.)
    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Error retrieving document content:', error);
    return '';
  }
}
