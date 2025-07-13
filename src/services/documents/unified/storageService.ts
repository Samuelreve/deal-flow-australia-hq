
import { supabase } from "@/integrations/supabase/client";
import { StorageUploadResult } from "./types";

/**
 * Service for handling file storage operations
 */
export class DocumentStorageService {
  /**
   * Upload file to storage with unique path
   */
  async uploadFileToStorage(file: File, dealId: string, userId: string, bucketName: string = 'deal_documents'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    return storagePath;
  }

  /**
   * Upload version file to storage
   */
  async uploadVersionFile(
    file: File,
    dealId: string,
    documentId: string,
    versionNumber: number,
    userId: string
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${documentId}/v${versionNumber}-${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;

    const { error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload version file: ${uploadError.message}`);
    }

    return storagePath;
  }

  /**
   * Create signed URL for document access
   */
  async createSignedUrl(dealId: string, filePath: string, expiresIn: number = 3600, bucketName: string = 'deal_documents'): Promise<string | null> {
    try {
      // If filePath already contains the dealId prefix, use it as is
      // Otherwise, prepend the dealId for backward compatibility
      const fullPath = filePath.startsWith(`${dealId}/`) ? filePath : `${dealId}/${filePath}`;
      const { data: urlData, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fullPath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return urlData?.signedUrl || null;
    } catch (error) {
      console.error('Unexpected error creating signed URL:', error);
      return null;
    }
  }

  /**
   * Delete files from storage
   */
  async deleteFiles(dealId: string, filePaths: string[], bucketName: string = 'deal_documents'): Promise<void> {
    // Handle both old format (filename only) and new format (dealId/filename)
    const fullPaths = filePaths.map(path => 
      path.startsWith(`${dealId}/`) ? path : `${dealId}/${path}`
    );
    await supabase.storage
      .from(bucketName)
      .remove(fullPaths);
  }
}
