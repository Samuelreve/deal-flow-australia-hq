
export class VersionHandler {
  constructor(private supabaseAdmin: any) {}

  async getNextVersionNumber(documentId: string): Promise<number> {
    const { data: versions, error: versionError } = await this.supabaseAdmin
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionError) {
      console.error('Error fetching versions:', versionError.message);
      throw new Error('Error fetching document versions');
    }

    return versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
  }

  async createVersion({ documentId, versionNumber, storagePath, size, type, userId }) {
    const { data: newVersion, error: insertVersionError } = await this.supabaseAdmin
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: versionNumber,
        storage_path: storagePath,
        size: size,
        type: type,
        uploaded_by: userId,
        description: `Version ${versionNumber}`
      })
      .select()
      .single();

    if (insertVersionError) {
      console.error('Error creating version record:', insertVersionError.message);
      throw new Error('Failed to save document version metadata');
    }

    return newVersion;
  }
}
