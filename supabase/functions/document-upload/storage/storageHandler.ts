
export class StorageHandler {
  constructor(private supabaseAdmin: any) {}

  async uploadFile(bucketName: string, path: string, fileBuffer: Uint8Array, contentType: string) {
    const { data: uploadData, error: uploadError } = await this.supabaseAdmin.storage
      .from(bucketName)
      .upload(path, fileBuffer, {
        contentType: contentType,
        upsert: true // Allow overwriting files
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      throw new Error('Failed to upload file to storage');
    }

    return uploadData;
  }

  async createSignedUrl(bucketName: string, path: string, expiresIn: number) {
    const { data: signedUrlData, error: signedUrlError } = await this.supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError.message);
    }

    return signedUrlData?.signedUrl;
  }

  async deleteFile(bucketName: string, path: string) {
    const { error: deleteError } = await this.supabaseAdmin.storage
      .from(bucketName)
      .remove([path]);

    if (deleteError) {
      console.error('Error deleting file from storage:', deleteError.message);
      throw new Error('Failed to delete file from storage');
    }
  }
}
