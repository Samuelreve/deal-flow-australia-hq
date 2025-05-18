
import { supabase } from "@/integrations/supabase/client";

/**
 * Base service with common database operations for documents
 */
export const documentBaseService = {
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
  }
};
