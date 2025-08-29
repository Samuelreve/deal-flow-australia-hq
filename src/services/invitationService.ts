
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define the expected structure of the successful backend acceptance response
export interface AcceptanceSuccessResponse {
  message: string;
  dealId: string;
}

export interface AcceptanceErrorResponse {
  error: string;
  message: string;
}

export class InvitationService {
  /**
   * Accept an invitation using Supabase RPC
   * @param token The invitation token
   * @param userId The user ID accepting the invitation
   * @param accessToken The authentication token (not used in Supabase RPC)
   * @returns Promise with the acceptance result
   */
  async acceptInvitation(
    token: string,
    userId: string,
    accessToken?: string
  ): Promise<{ success: boolean; data?: AcceptanceSuccessResponse; error?: string }> {
    try {
      console.log('Accepting invitation with:', { token, userId });
      
      const { data, error } = await supabase.rpc('accept_invitation', {
        p_token: token,
        p_user_id: userId
      });

      console.log('Accept invitation response:', { data, error });

      if (error) {
        console.error('Supabase RPC error:', error);
        return {
          success: false,
          error: error.message || 'Failed to accept invitation'
        };
      }

      // The function returns an array, check if we have valid data
      if (data && Array.isArray(data) && data.length > 0 && data[0].success) {
        const result = data[0];
        return {
          success: true,
          data: {
            message: result.message || 'Invitation accepted successfully',
            dealId: result.deal_id
          }
        };
      } else {
        console.error('Invalid response data:', data);
        return {
          success: false,
          error: 'Failed to accept invitation - invalid response'
        };
      }
    } catch (error: any) {
      console.error('Invitation acceptance error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred while accepting the invitation'
      };
    }
  }
}

// Create a singleton instance
export const invitationService = new InvitationService();
