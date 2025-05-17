
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for storage operations related to documents
 */
export const documentStorageService = {
  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(file: File, dealId: string, userId: string): Promise<string> {
    // Create a unique filename with user ID to help with permissions
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('deal-documents')
      .upload(storagePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    return filePath;
  },

  /**
   * Delete a file from Supabase storage
   */
  async deleteFile(filePath: string, dealId: string): Promise<void> {
    const { error: storageError } = await supabase.storage
      .from('deal-documents')
      .remove([`${dealId}/${filePath}`]);
    
    if (storageError) {
      console.warn("Storage delete error:", storageError);
      // Continue anyway to clean up database entry
    }
  },

  /**
   * Create a signed URL for a file
   */
  async createSignedUrl(dealId: string, filePath: string, expiresIn: number = 3600): Promise<string | null> {
    const { data: urlData } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${filePath}`, expiresIn);
    
    return urlData?.signedUrl || null;
  }
};
