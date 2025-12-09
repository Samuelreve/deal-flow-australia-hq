
import { UserRole } from "@/types/auth";

// Interface for invitation form data
export interface InvitationFormData {
  inviteeEmail: string;
  inviteeRole: UserRole | '';
}

// Interface for invitation API response
export interface InvitationResponse {
  success: boolean;
  message: string;
  token?: string;
}

// Interface for deal invitation
export interface DealInvitation {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  status: string;
  token?: string | null;
  token_expires_at?: string | null;
  invited_by: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

// Interface for invitations API response
export interface DealInvitationsResponse {
  success: boolean;
  invitations: DealInvitation[];
  message?: string;
}
