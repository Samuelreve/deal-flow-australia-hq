
import { supabase } from "@/integrations/supabase/client";

/**
 * Service focused on document permission checks
 */
export const documentPermissionService = {
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
  }
};
