
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Generate a new storage path for the restored version
export function generateNewFilePath(
  originalFilePath: string,
  documentId: string,
  nextVersionNumber: number
) {
  const fileExtension = originalFilePath.split('.').pop();
  const newFileName = `v${nextVersionNumber}_${Date.now()}.${fileExtension}`;
  return `documents/${documentId}/${newFileName}`;
}

// Download file from storage
export async function downloadFile(
  supabase: ReturnType<typeof createClient>,
  dealBucket: string,
  dealId: string,
  filePath: string
) {
  const { data: fileData, error: fileError } = await supabase.storage
    .from(dealBucket)
    .download(`${dealId}/${filePath}`);
    
  if (fileError || !fileData) {
    throw new Error('Failed to access file content');
  }
  
  return fileData;
}

// Upload file to storage
export async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  dealBucket: string,
  dealId: string,
  filePath: string,
  fileData: Blob,
  contentType: string
) {
  const { error: uploadError } = await supabase.storage
    .from(dealBucket)
    .upload(`${dealId}/${filePath}`, fileData, {
      contentType: contentType,
      upsert: false
    });
    
  if (uploadError) {
    throw new Error(`Failed to upload restored file: ${uploadError.message}`);
  }
}

// Generate a signed URL for the new version
export async function createSignedUrl(
  supabase: ReturnType<typeof createClient>,
  dealBucket: string,
  dealId: string,
  filePath: string
) {
  const { data: signedUrlData } = await supabase.storage
    .from(dealBucket)
    .createSignedUrl(`${dealId}/${filePath}`, 60 * 60); // 1 hour expiry
    
  return signedUrlData?.signedUrl || '';
}
