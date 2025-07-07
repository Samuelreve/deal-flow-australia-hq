import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export interface InviteRequest {
  dealId: string;
  inviteeEmail: string;
  inviteeRole: 'buyer' | 'lawyer' | 'admin';
}

export interface InvitationResult {
  success: boolean;
  token?: string;
  message: string;
}

export async function verifyDealParticipation(supabaseClient: any, dealId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('deal_participants')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('You are not authorized to invite participants to this deal');
  }

  if (!['seller', 'admin'].includes(data.role)) {
    throw new Error('Only sellers and admins can send invitations');
  }

  return data;
}

export async function verifyDealStatus(supabaseClient: any, dealId: string) {
  const { data, error } = await supabaseClient
    .from('deals')
    .select('title, status')
    .eq('id', dealId)
    .single();

  if (error || !data) {
    throw new Error('Deal not found');
  }

  return data;
}

export async function findExistingUser(supabaseAdmin: any, email: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single();

  if (error) {
    // User doesn't exist, which is fine for invitations
    return null;
  }

  return data;
}

export async function getInviterProfile(supabaseClient: any, userId: string) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .single();

  return data;
}

export async function checkExistingParticipant(supabaseClient: any, dealId: string, userId: string) {
  const { data, error } = await supabaseClient
    .from('deal_participants')
    .select('id')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();

  return !error && data;
}

export async function checkExistingInvitation(supabaseClient: any, dealId: string, email: string) {
  const { data, error } = await supabaseClient
    .from('deal_invitations')
    .select('id')
    .eq('deal_id', dealId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  return !error && data;
}

export async function addExistingUserAsParticipant(supabaseAdmin: any, dealId: string, userId: string, role: string) {
  const { data, error } = await supabaseAdmin
    .from('deal_participants')
    .insert({
      deal_id: dealId,
      user_id: userId,
      role: role
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to add participant to deal');
  }

  return data;
}

export async function createInvitation(supabaseClient: any, dealId: string, email: string, role: string, userId: string) {
  // Generate secure token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { data, error } = await supabaseClient
    .from('deal_invitations')
    .insert({
      deal_id: dealId,
      invitee_email: email,
      invitee_role: role,
      invited_by_user_id: userId,
      invitation_token: token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to create invitation');
  }

  return { ...data, token };
}