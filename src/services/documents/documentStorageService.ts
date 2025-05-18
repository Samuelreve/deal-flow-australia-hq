
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
   * Upload a new version of a file to Supabase storage
   */
  async uploadVersionFile(
    file: File, 
    dealId: string, 
    documentId: string, 
    versionNumber: number, 
    userId: string
  ): Promise<string> {
    // Create a unique filename for this version
    const fileExt = file.name.split('.').pop();
    const filePath = `${documentId}/v${versionNumber}-${userId}-${Date.now()}.${fileExt}`;
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
  },

  /**
   * Get a signed URL for a specific version of a document
   */
  async getSignedUrlForVersion(
    dealId: string, 
    documentId: string, 
    versionId: string, 
    expiresIn: number = 3600
  ) {
    // First, get the version details from the database
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .eq('document_id', documentId)
      .single();
    
    if (versionError) {
      console.error("Error fetching version:", versionError);
      return { error: versionError, data: null };
    }
    
    // Create a signed URL for the version's file
    const { data: urlData, error: urlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${version.storage_path}`, expiresIn);
    
    if (urlError) {
      console.error("Error creating signed URL:", urlError);
      return { error: urlError, data: null };
    }
    
    return { 
      data: { 
        version,
        signedUrl: urlData?.signedUrl 
      },
      error: null
    };
  }
};
