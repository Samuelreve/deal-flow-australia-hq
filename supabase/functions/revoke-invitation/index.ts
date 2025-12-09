import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId, dealId } = await req.json();
    
    if (!invitationId || !dealId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
    });
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is a participant with appropriate role
    const { data: participantData, error: participantError } = await supabaseClient
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (participantError || !participantData) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to manage invitations for this deal" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only sellers and admins can revoke invitations
    if (!['seller', 'admin'].includes(participantData.role)) {
      return new Response(
        JSON.stringify({ error: "Only sellers and admins can revoke invitations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('deal_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('deal_id', dealId)
      .single();

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: "Can only revoke pending invitations" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the invitation status to revoked
    const { error: updateError } = await supabaseAdmin
      .from('deal_invitations')
      .update({
        status: 'revoked',
        invitation_token: null, // Clear the token
        token_expires_at: null
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error("Error revoking invitation:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to revoke invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action
    await supabaseAdmin
      .from('audit_log')
      .insert({
        user_id: user.id,
        event: 'invitation_revoked',
        metadata: {
          deal_id: dealId,
          invitation_id: invitationId,
          invitee_email: invitation.invitee_email
        }
      });

    console.log(`Invitation ${invitationId} revoked by user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation revoked successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
