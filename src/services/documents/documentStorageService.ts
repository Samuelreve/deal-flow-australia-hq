
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
    
    console.log('Uploading file to storage path:', storagePath);
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, file);
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
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
    
    console.log('Uploading version file to storage path:', storagePath);
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, file);
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload version file: ${uploadError.message}`);
    }
    
    return filePath;
  },

  /**
   * Delete a file from Supabase storage
   */
  async deleteFile(filePath: string, dealId: string): Promise<void> {
    console.log('Deleting file from storage:', `${dealId}/${filePath}`);
    
    const { error: storageError } = await supabase.storage
      .from('deal_documents')
      .remove([`${dealId}/${filePath}`]);
    
    if (storageError) {
      console.warn("Storage delete error:", storageError);
      // Continue anyway to clean up database entry
    }
  },

  /**
   * Create a signed URL for a file with error handling
   */
  async createSignedUrl(dealId: string, filePath: string, expiresIn: number = 3600, isSignedDocument: boolean = false): Promise<string | null> {
    try {
      const fullPath = `${dealId}/${filePath}`;
      const bucketName = isSignedDocument ? 'signed_document' : 'deal_documents';
      console.log('Creating signed URL for:', fullPath, 'in bucket:', bucketName);
      
      const { data: urlData, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fullPath, expiresIn);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        // Return null instead of throwing to allow graceful fallback
        return null;
      }
      
      return urlData?.signedUrl || null;
    } catch (error) {
      console.error('Unexpected error creating signed URL:', error);
      return null;
    }
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
    try {
      console.log('Getting signed URL for version:', versionId);
      
      // First, get the version details from the database, and check document status
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select(`
          *,
          documents:document_id (
            status,
            category
          )
        `)
        .eq('id', versionId)
        .eq('document_id', documentId)
        .single();
      
      if (versionError) {
        console.error("Error fetching version:", versionError);
        return { error: versionError, data: null };
      }
      
      // Check if this is a signed document to determine the correct bucket
      const isSignedDocument = version.documents?.status === 'signed' || version.documents?.category === 'signed_contract';
      
      // Create a signed URL for the version's file
      const signedUrl = await this.createSignedUrl(dealId, version.storage_path, expiresIn, isSignedDocument);
      
      if (!signedUrl) {
        return { 
          error: { message: 'Failed to create signed URL' }, 
          data: null 
        };
      }
      
      return { 
        data: { 
          version,
          signedUrl
        },
        error: null
      };
    } catch (error) {
      console.error("Unexpected error getting signed URL for version:", error);
      return { 
        error: { message: 'Unexpected error occurred' }, 
        data: null 
      };
    }
  }
};
