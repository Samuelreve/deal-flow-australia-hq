
import { supabase } from "@/integrations/supabase/client";
import { StorageUploadResult } from "./types";

/**
 * Service for handling file storage operations
 */
export class DocumentStorageService {
  /**
   * Upload file to storage with unique path
   */
  async uploadFileToStorage(file: File, dealId: string, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;

    const { error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Return just the filename part, not the full path
    return filePath;
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

    // Return just the relative path part, not including dealId
    return filePath;
  }

  /**
   * Create signed URL for document access
   */
  async createSignedUrl(dealId: string, filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      // Validate inputs
      if (!dealId || !filePath) {
        console.error('Missing required parameters for signed URL creation:', { dealId, filePath });
        return null;
      }

      const fullPath = `${dealId}/${filePath}`;
      const { data: urlData, error } = await supabase.storage
        .from('deal_documents')
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
  async deleteFiles(dealId: string, filePaths: string[]): Promise<void> {
    const fullPaths = filePaths.map(path => `${dealId}/${path}`);
    await supabase.storage
      .from('deal_documents')
      .remove(fullPaths);
  }
}
