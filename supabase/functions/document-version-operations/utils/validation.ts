
/**
 * Verify that a document version belongs to a specific deal
 */
export async function verifyVersionBelongsToDeal(supabase: any, versionId: string, dealId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('document_id')
    .eq('id', versionId)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('deal_id')
    .eq('id', data.document_id)
    .single();
  
  if (docError || !document) {
    return false;
  }
  
  return document.deal_id === dealId;
}
