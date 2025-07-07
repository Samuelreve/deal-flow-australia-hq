import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ status: 'invalid', error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get invitation details
    const { data: invitation, error } = await supabaseAdmin
      .from('deal_invitations')
      .select(`
        id,
        deal_id,
        invitee_email,
        invitee_role,
        status,
        token_expires_at,
        invited_by_user_id,
        deals!inner(title)
      `)
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      return new Response(
        JSON.stringify({ status: 'invalid', error: 'Invalid or expired invitation' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get inviter name separately
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', invitation.invited_by_user_id)
      .single();

    // Check if invitation has expired
    if (invitation.token_expires_at && new Date(invitation.token_expires_at) < new Date()) {
      // Update invitation status to expired
      await supabaseAdmin
        .from('deal_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return new Response(
        JSON.stringify({ status: 'invalid', error: 'Invitation has expired' }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return invitation details
    return new Response(
      JSON.stringify({
        status: 'valid',
        dealId: invitation.deal_id,
        inviteeEmail: invitation.invitee_email,
        inviteeRole: invitation.invitee_role,
        dealTitle: invitation.deals.title,
        inviterName: inviterProfile?.name || 'Unknown',
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verify invitation error:", error);
    return new Response(
      JSON.stringify({ status: 'invalid', error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});