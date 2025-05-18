
import { Document } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentMapperService } from "./documentMapperService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for retrieving documents and verifying access
 */
export const documentRetrievalService = {
  /**
   * Get all documents for a deal
   * Note: RLS policies at the database level ensure users only see documents from deals they participate in
   */
  async getDocuments(dealId: string): Promise<Document[]> {
    const documentsMetadata = await documentDatabaseService.fetchDocuments(dealId);
      
    return Promise.all(
      documentsMetadata.map(doc => documentMapperService.mapToDocument(doc, dealId))
    );
  },

  /**
   * Verify if a user has access to a document
   */
  async verifyDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    try {
      return await documentDatabaseService.checkDocumentAccess(documentId, userId);
    } catch (error) {
      console.error("Error checking document access:", error);
      return false;
    }
  },

  /**
   * Check if user has permission to view documents for a specific deal
   * Used for checking before any document-related operations
   */
  async verifyDealDocumentAccess(dealId: string, userId: string): Promise<{
    canAccess: boolean,
    role?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', dealId)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        return { canAccess: false };
      }
      
      return { 
        canAccess: true, 
        role: data.role 
      };
    } catch (error) {
      console.error("Error verifying deal document access:", error);
      return { canAccess: false };
    }
  },
  
  /**
   * Get document access control info for a user
   * Returns information about what actions a user can perform on documents
   */
  async getDocumentAccessControl(dealId: string, userId: string): Promise<{
    canUpload: boolean;
    canDelete: boolean;
    canAddVersions: boolean;
    userRole: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', dealId)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        return {
          canUpload: false,
          canDelete: false,
          canAddVersions: false,
          userRole: null
        };
      }
      
      const userRole = data.role;
      
      // Define role-based permissions
      // This could be moved to a separate permissions service if it grows more complex
      const canUpload = ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
      const canDelete = ['admin', 'seller'].includes(userRole.toLowerCase());
      const canAddVersions = ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
      
      return {
        canUpload,
        canDelete,
        canAddVersions,
        userRole
      };
    } catch (error) {
      console.error("Error getting document access control:", error);
      return {
        canUpload: false,
        canDelete: false,
        canAddVersions: false,
        userRole: null
      };
    }
  },

  /**
   * Check if the deal status allows document operations
   */
  async checkDealStatusForDocumentOperations(dealId: string): Promise<{
    allowsUpload: boolean;
    allowsDelete: boolean;
    dealStatus: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('status')
        .eq('id', dealId)
        .single();
      
      if (error || !data) {
        return {
          allowsUpload: false,
          allowsDelete: false,
          dealStatus: null
        };
      }
      
      // Define which deal statuses allow which operations
      const statusAllowingUploads = ['draft', 'active', 'pending'];
      const statusAllowingDeletion = ['draft', 'active', 'pending'];
      
      return {
        allowsUpload: statusAllowingUploads.includes(data.status),
        allowsDelete: statusAllowingDeletion.includes(data.status),
        dealStatus: data.status
      };
    } catch (error) {
      console.error("Error checking deal status for document operations:", error);
      return {
        allowsUpload: false,
        allowsDelete: false,
        dealStatus: null
      };
    }
  }
};
