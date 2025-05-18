
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Types
export interface InviteRequest {
  dealId: string;
  inviteeEmail: string;
  inviteeRole: string;
}

export interface InvitationResult {
  success: boolean;
  message: string;
  [key: string]: any;
}

// Function to check if the user is a participant in the deal
export async function verifyDealParticipation(supabaseClient: any, dealId: string, userId: string) {
  const { data: participantData, error: participantError } = await supabaseClient
    .from("deal_participants")
    .select("role")
    .eq("deal_id", dealId)
    .eq("user_id", userId)
    .single();
  
  if (participantError || !participantData) {
    throw new Error("You are not a participant in this deal");
  }
  
  if (participantData.role !== "seller" && participantData.role !== "admin") {
    throw new Error("Only sellers and admins can invite participants");
  }
  
  return participantData;
}

// Function to check deal status
export async function verifyDealStatus(supabaseClient: any, dealId: string) {
  const { data: dealData, error: dealError } = await supabaseClient
    .from("deals")
    .select("status, title")
    .eq("id", dealId)
    .single();
  
  if (dealError || !dealData) {
    throw new Error("Deal not found");
  }
  
  if (dealData.status !== "draft" && dealData.status !== "active") {
    throw new Error("Invitations are only allowed for draft or active deals");
  }
  
  return dealData;
}

// Function to check for existing user with the email
export async function findExistingUser(supabaseAdmin: any, inviteeEmail: string) {
  const { data: existingUsers, error: existingUserError } = await supabaseAdmin.auth
    .admin
    .listUsers();
  
  if (existingUserError) {
    throw new Error("Error checking existing users");
  }
  
  return existingUsers.users.find(
    (u: any) => u.email?.toLowerCase() === inviteeEmail.toLowerCase()
  );
}

// Function to get inviter profile info
export async function getInviterProfile(supabaseClient: any, userId: string) {
  const { data: inviterProfile, error: inviterProfileError } = await supabaseClient
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", userId)
    .single();

  if (inviterProfileError) {
    throw new Error("Failed to fetch inviter profile information");
  }

  return inviterProfile;
}

// Function to check if user is already a participant
export async function checkExistingParticipant(supabaseClient: any, dealId: string, userId: string) {
  const { data: existingParticipant, error: existingParticipantError } = await supabaseClient
    .from("deal_participants")
    .select("id")
    .eq("deal_id", dealId)
    .eq("user_id", userId)
    .single();
  
  return !existingParticipantError && existingParticipant;
}

// Function to check for existing invitation
export async function checkExistingInvitation(supabaseClient: any, dealId: string, inviteeEmail: string) {
  const { data: existingInvitation, error: invitationError } = await supabaseClient
    .from("deal_invitations")
    .select("id, status")
    .eq("deal_id", dealId)
    .eq("invitee_email", inviteeEmail.toLowerCase())
    .eq("status", "pending")
    .single();
  
  return !invitationError && existingInvitation;
}

// Function to add existing user as a participant
export async function addExistingUserAsParticipant(
  supabaseAdmin: any, 
  dealId: string, 
  userId: string, 
  inviteeRole: string
): Promise<any> {
  const { data: newParticipant, error: addParticipantError } = await supabaseAdmin
    .from("deal_participants")
    .insert([
      {
        deal_id: dealId,
        user_id: userId,
        role: inviteeRole
      }
    ])
    .select("*")
    .single();
  
  if (addParticipantError) {
    throw new Error("Failed to add user as participant");
  }
  
  return newParticipant;
}

// Function to create an invitation for new user
export async function createInvitation(
  supabaseClient: any, 
  dealId: string, 
  inviteeEmail: string, 
  inviteeRole: string
): Promise<any> {
  const { data: inviteResult, error: inviteError } = await supabaseClient.rpc(
    'create_deal_invitation',
    {
      p_deal_id: dealId,
      p_invitee_email: inviteeEmail.toLowerCase(),
      p_invitee_role: inviteeRole
    }
  );

  if (inviteError) {
    throw new Error(inviteError.message || "Failed to create invitation");
  }
  
  return inviteResult;
}
