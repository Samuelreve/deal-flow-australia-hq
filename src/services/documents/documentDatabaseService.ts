
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
   * Check if a user is a participant in a deal
   */
  async checkUserCanUploadToDeal(dealId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Check if the participant role is allowed to upload documents
    // You can customize this logic based on your application's requirements
    const allowedRoles = ['admin', 'seller', 'lawyer'];
    return allowedRoles.includes(data.role);
  },
  
  /**
   * Check if user has access to a document
   */
  async checkDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    // Get the deal ID for this document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', documentId)
      .single();
    
    if (docError || !document) {
      return false;
    }
    
    // Check if user is a participant in this deal
    const { data, error } = await supabase
      .from('deal_participants')
      .select('id')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId);
    
    return !error && data && data.length > 0;
  },
  
  /**
   * Check if user can modify a document
   */
  async checkUserCanModifyDocument(documentId: string, userId: string): Promise<boolean> {
    // Get the document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id, uploaded_by')
      .eq('id', documentId)
      .single();
    
    if (docError || !document) {
      return false;
    }
    
    // Check if user is the uploader or has admin/seller role
    const { data: participant, error } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
    
    if (error || !participant) {
      return false;
    }
    
    // Document uploader can always modify their document
    if (document.uploaded_by === userId) {
      return true;
    }
    
    // Admins and sellers can modify any document
    return ['admin', 'seller'].includes(participant.role);
  },
  
  /**
   * Check if user can delete a document
   */
  async checkUserCanDeleteDocument(documentId: string, userId: string): Promise<boolean> {
    // Get the document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id, uploaded_by')
      .eq('id', documentId)
      .single();
    
    if (docError || !document) {
      return false;
    }
    
    // Check if user is the uploader or has admin/seller role
    const { data: participant, error } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
    
    if (error || !participant) {
      return false;
    }
    
    // Document uploader can delete their own document
    if (document.uploaded_by === userId) {
      return true;
    }
    
    // Only admins and sellers can delete others' documents
    return ['admin', 'seller'].includes(participant.role);
  },
  
  /**
   * Check if user can delete a document version
   */
  async checkUserCanDeleteVersion(documentId: string, versionId: string, userId: string): Promise<boolean> {
    // Get the document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', documentId)
      .single();
    
    if (docError || !document) {
      return false;
    }
    
    // Get the version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('uploaded_by')
      .eq('id', versionId)
      .eq('document_id', documentId)
      .single();
    
    if (versionError || !version) {
      return false;
    }
    
    // Check participant role
    const { data: participant, error } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
    
    if (error || !participant) {
      return false;
    }
    
    // Version uploader can delete their own version
    if (version.uploaded_by === userId) {
      return true;
    }
    
    // Only admins and sellers can delete others' versions
    return ['admin', 'seller'].includes(participant.role);
  },

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
