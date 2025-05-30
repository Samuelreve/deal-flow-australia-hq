
import { supabase } from "@/integrations/supabase/client";
import { DocumentCreationResult } from "./types";

/**
 * Service for creating new documents in the database
 */
export class DocumentCreationService {
  /**
   * Create a new document with its first version
   */
  async createNewDocument(
    file: File,
    dealId: string,
    category: string,
    userId: string,
    filePath: string,
    documentName?: string
  ): Promise<DocumentCreationResult> {
    // Create document record
    const { data: documentData, error: docError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: documentName || file.name,
        description: '',
        storage_path: filePath,
        uploaded_by: userId,
        size: file.size,
        type: file.type,
        status: "draft",
        version: 1,
        milestone_id: null,
        category
      })
      .select()
      .single();

    if (docError) throw docError;

    // Create initial version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentData.id,
        version_number: 1,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: 'Initial version'
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update document with latest version ID
    await supabase
      .from('documents')
      .update({ latest_version_id: versionData.id })
      .eq('id', documentData.id);

    return { document: documentData, version: versionData };
  }
}
