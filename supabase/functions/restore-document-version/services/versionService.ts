
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Get the version to restore
export async function getVersionToRestore(
  supabase: ReturnType<typeof createClient>,
  versionId: string,
  documentId: string
) {
  const { data: versionToRestore, error: versionError } = await supabase
    .from('document_versions')
    .select('*')
    .eq('id', versionId)
    .eq('document_id', documentId)
    .single();
    
  if (versionError || !versionToRestore) {
    throw new Error('Version not found');
  }
  
  return versionToRestore;
}

// Get the document to verify access
export async function getDocument(
  supabase: ReturnType<typeof createClient>,
  documentId: string,
  dealId: string
) {
  const { data: document, error: documentError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('deal_id', dealId)
    .single();
    
  if (documentError || !document) {
    throw new Error('Document not found');
  }
  
  return document;
}

// Get the next version number
export async function getNextVersionNumber(
  supabase: ReturnType<typeof createClient>,
  documentId: string
) {
  const { data: versions, error: versionsError } = await supabase
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1);
    
  if (versionsError) {
    throw new Error('Failed to get latest version number');
  }

  return versions && versions.length > 0 
    ? versions[0].version_number + 1 
    : 1;
}

// Create a new version record
export async function createNewVersionRecord(
  supabase: ReturnType<typeof createClient>,
  documentId: string,
  nextVersionNumber: number,
  newFilePath: string,
  userId: string,
  originalVersion: any
) {
  const { data: newVersion, error: insertError } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: nextVersionNumber,
      storage_path: newFilePath,
      size: originalVersion.size,
      type: originalVersion.type,
      uploaded_by: userId,
      description: `Restored from version ${originalVersion.version_number}`
    })
    .select()
    .single();
    
  if (insertError || !newVersion) {
    throw new Error('Failed to create restored version');
  }
  
  return newVersion;
}

// Update the document to point to the new version as latest
export async function updateDocumentLatestVersion(
  supabase: ReturnType<typeof createClient>,
  documentId: string,
  newVersionId: string
) {
  const { error: updateDocError } = await supabase
    .from('documents')
    .update({
      latest_version_id: newVersionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);
    
  if (updateDocError) {
    throw new Error('Failed to update document');
  }
}
