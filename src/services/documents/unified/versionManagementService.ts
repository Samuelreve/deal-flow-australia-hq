
import { supabase } from "@/integrations/supabase/client";
import { DocumentCreationResult } from "./types";

/**
 * Service for managing document versions
 */
export class VersionManagementService {
  /**
   * Add a new version to an existing document
   */
  async addDocumentVersion(
    file: File,
    documentId: string,
    userId: string,
    filePath: string
  ): Promise<DocumentCreationResult> {
    // Get existing document
    const { data: existingDoc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Get next version number
    const { data: versions, error: versionsError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionsError) throw versionsError;

    const nextVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Create version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersionNumber,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: `Version ${nextVersionNumber}`
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update document with latest version
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        latest_version_id: versionData.id,
        version: nextVersionNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return { document: existingDoc, version: versionData };
  }
}
