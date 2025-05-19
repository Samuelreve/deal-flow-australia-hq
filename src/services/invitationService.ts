
import { toast } from 'sonner';

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
  private acceptInvitationUrl = '/api/invitations/accept'; // API endpoint

  /**
   * Accept an invitation
   * @param token The invitation token
   * @param userId The user ID accepting the invitation
   * @param accessToken The authentication token
   * @returns Promise with the acceptance result
   */
  async acceptInvitation(
    token: string,
    userId: string,
    accessToken: string
  ): Promise<{ success: boolean; data?: AcceptanceSuccessResponse; error?: string }> {
    try {
      // Make the POST request to the backend acceptance endpoint
      const response = await fetch(this.acceptInvitationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token, userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.message || `Invitation acceptance failed with status: ${response.status}`;
        
        // Handle specific error cases
        if (response.status === 400) {
          errorMessage = errorData.message || 'Invalid invitation data.';
        } else if (response.status === 404) {
          errorMessage = errorData.message || 'Invitation not found or expired.';
        } else if (response.status === 409) {
          errorMessage = errorData.message || 'Invitation already accepted or you are already a participant.';
        } else if (response.status === 403) {
          errorMessage = errorData.message || 'Permission denied to accept this invitation.';
        }
        
        return { 
          success: false, 
          error: errorMessage
        };
      }
      
      const data: AcceptanceSuccessResponse = await response.json();
      return {
        success: true,
        data
      };
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
