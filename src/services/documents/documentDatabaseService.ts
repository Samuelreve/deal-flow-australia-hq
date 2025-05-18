
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/deal";

export interface DocumentMetadata {
  id: string;
  deal_id: string;
  name: string;
  description: string | null;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  size: number;
  type: string;
  status: "draft" | "final" | "signed";
  version: number;
  milestone_id: string | null;
  category: string | null;
  latest_version_id: string | null;
}

export interface DocumentVersionMetadata {
  id: string;
  document_id: string;
  version_number: number;
  storage_path: string;
  size: number;
  type: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  description: string | null;
}

/**
 * Service responsible for database operations related to documents
 */
export const documentDatabaseService = {
  /**
   * Fetch all documents for a deal
   */
  async fetchDocuments(dealId: string): Promise<DocumentMetadata[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as DocumentMetadata[];
  },

  /**
   * Fetch all versions for a document
   */
  async fetchDocumentVersions(documentId: string): Promise<DocumentVersionMetadata[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as DocumentVersionMetadata[];
  },

  /**
   * Save document metadata to the database
   */
  async saveDocumentMetadata(metadata: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at' | 'latest_version_id'>): Promise<DocumentMetadata> {
    const { data, error } = await supabase
      .from('documents')
      .insert(metadata)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as DocumentMetadata;
  },

  /**
   * Save document version metadata to the database
   */
  async saveDocumentVersion(
    versionData: Omit<DocumentVersionMetadata, 'id' | 'created_at' | 'uploaded_at'>
  ): Promise<DocumentVersionMetadata> {
    const { data, error } = await supabase
      .from('document_versions')
      .insert(versionData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Update the document's latest_version_id
    const { error: updateError } = await supabase
      .from('documents')
      .update({ latest_version_id: data.id })
      .eq('id', versionData.document_id);
    
    if (updateError) {
      console.error("Error updating document's latest version:", updateError);
      // Continue anyway to return the version that was created
    }
    
    return data as DocumentVersionMetadata;
  },

  /**
   * Delete document metadata from the database
   */
  async deleteDocumentMetadata(documentId: string): Promise<void> {
    // Deleting the document will cascade and delete all its versions
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) {
      throw error;
    }
  },

  /**
   * Delete a specific document version
   */
  async deleteDocumentVersion(versionId: string, documentId: string): Promise<void> {
    // Check if this is the latest version
    const { data: document } = await supabase
      .from('documents')
      .select('latest_version_id')
      .eq('id', documentId)
      .single();
    
    // Delete the version
    const { error } = await supabase
      .from('document_versions')
      .delete()
      .eq('id', versionId);
    
    if (error) {
      throw error;
    }
    
    // If this was the latest version, update the document to point to the new latest version
    if (document && document.latest_version_id === versionId) {
      // Find the new latest version (highest version number)
      const { data: versions } = await supabase
        .from('document_versions')
        .select('id')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      // Update the document's latest_version_id
      if (versions && versions.length > 0) {
        await supabase
          .from('documents')
          .update({ latest_version_id: versions[0].id })
          .eq('id', documentId);
      } else {
        // No versions left, set latest_version_id to null
        await supabase
          .from('documents')
          .update({ latest_version_id: null })
          .eq('id', documentId);
      }
    }
  }
};
