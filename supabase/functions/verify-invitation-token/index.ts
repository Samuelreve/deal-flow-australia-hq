import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ status: 'invalid', error: 'Missing token' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key for database access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query the deal_invitations table to find the invitation
    const { data: invitation, error } = await supabase
      .from('deal_invitations')
      .select(`
        id,
        deal_id,
        invitee_email,
        invitee_role,
        status,
        created_at,
        invited_by_user_id
      `)
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      console.error('Database error finding invitation:', error);
      return new Response(
        JSON.stringify({ 
          status: 'invalid', 
          error: 'Database error occurred' 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitation) {
      console.log('No invitation found for token:', token);
      return new Response(
        JSON.stringify({ 
          status: 'invalid', 
          error: 'Invitation not found or has expired' 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get deal details separately
    const { data: deal } = await supabase
      .from('deals')
      .select('id, title')
      .eq('id', invitation.deal_id)
      .maybeSingle();

    // Get inviter details separately  
    const { data: inviter } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', invitation.invited_by_user_id)
      .maybeSingle();

    // Check if invitation has expired (optional - add expiry logic if needed)
    const createdAt = new Date(invitation.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > 30) { // Expire after 30 days
      return new Response(
        JSON.stringify({ 
          status: 'invalid', 
          error: 'Invitation has expired' 
        }),
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
        dealTitle: deal?.title || 'Unknown Deal',
        inviterName: inviter?.name || 'Unknown User',
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error verifying invitation:', error);
    return new Response(
      JSON.stringify({ 
        status: 'invalid', 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});