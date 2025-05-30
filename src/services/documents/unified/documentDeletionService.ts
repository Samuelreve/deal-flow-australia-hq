
import { supabase } from "@/integrations/supabase/client";
import { DocumentStorageService } from "./storageService";

/**
 * Service for deleting documents and their associated data
 */
export class DocumentDeletionService {
  private storageService: DocumentStorageService;

  constructor() {
    this.storageService = new DocumentStorageService();
  }

  /**
   * Delete document and its files
   */
  async deleteDocument(documentId: string, dealId: string): Promise<void> {
    // Get all versions for cleanup
    const { data: versions } = await supabase
      .from('document_versions')
      .select('storage_path')
      .eq('document_id', documentId);

    // Delete files from storage
    if (versions && versions.length > 0) {
      const filePaths = versions.map(v => v.storage_path);
      await this.storageService.deleteFiles(dealId, filePaths);
    }

    // Delete database records (versions first due to foreign key)
    await supabase
      .from('document_versions')
      .delete()
      .eq('document_id', documentId);

    await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
  }
}
