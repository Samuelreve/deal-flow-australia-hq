
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling document permissions and access control
 */
export class DocumentPermissionService {
  /**
   * Check if user can upload to deal
   */
  async checkUserCanUploadToDeal(dealId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return ['admin', 'seller', 'lawyer'].includes(data.role);
  }

  /**
   * Check if user can modify document
   */
  async checkUserCanModifyDocument(documentId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('documents')
      .select('uploaded_by, deal_id')
      .eq('id', documentId)
      .single();

    if (error) return false;

    // User is the uploader
    if (data.uploaded_by === userId) return true;

    // Check if user is admin/seller in the deal
    return await this.checkUserCanUploadToDeal(data.deal_id, userId);
  }
}
