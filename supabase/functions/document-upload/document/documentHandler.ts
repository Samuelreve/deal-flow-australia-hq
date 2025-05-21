
export class DocumentHandler {
  constructor(private supabaseAdmin: any) {}

  async getExistingDocument(documentId: string, dealId: string) {
    const { data: existingDoc, error: existingDocError } = await this.supabaseAdmin
      .from('documents')
      .select('id, name')
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .single();

    if (existingDocError || !existingDoc) {
      console.error('Error verifying document:', existingDocError?.message);
      throw new Error('Document not found for this deal');
    }

    return existingDoc;
  }

  async createDocument({ dealId, name, category, userId, fileSize, fileType }) {
    const { data: newDocument, error: insertDocError } = await this.supabaseAdmin
      .from('documents')
      .insert({
        deal_id: dealId,
        name: name,
        category: category,
        uploaded_by: userId,
        size: fileSize,
        type: fileType,
        storage_path: '', // Temporary, will update after version is created
        status: 'draft'
      })
      .select()
      .single();

    if (insertDocError) {
      console.error('Error creating document record:', insertDocError.message);
      throw new Error('Failed to create document record');
    }

    return newDocument;
  }

  async updateStoragePath(documentId: string, storagePath: string) {
    const { error: updateError } = await this.supabaseAdmin
      .from('documents')
      .update({ storage_path: storagePath })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document storage path:', updateError.message);
      throw new Error('Failed to update document storage path');
    }
  }

  async updateLatestVersion(documentId: string, versionId: string) {
    const { error: updateError } = await this.supabaseAdmin
      .from('documents')
      .update({ latest_version_id: versionId })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document with latest version:', updateError.message);
      throw new Error('Failed to update document with latest version reference');
    }
  }

  async deleteDocument(documentId: string) {
    const { error: deleteError } = await this.supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('Error deleting document:', deleteError.message);
      throw new Error('Failed to delete document');
    }
  }
}
