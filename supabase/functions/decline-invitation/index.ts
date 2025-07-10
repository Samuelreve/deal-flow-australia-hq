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
        JSON.stringify({ success: false, error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get invitation details first
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('deal_invitations')
      .select('id, status, token_expires_at')
      .eq('invitation_token', token)
      .single();

    if (fetchError || !invitation) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid invitation token' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invitation is no longer pending' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation has expired
    if (invitation.token_expires_at && new Date(invitation.token_expires_at) < new Date()) {
      // Update invitation status to expired
      await supabaseAdmin
        .from('deal_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return new Response(
        JSON.stringify({ success: false, error: 'Invitation has expired' }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update invitation status to declined
    const { error: updateError } = await supabaseAdmin
      .from('deal_invitations')
      .update({ 
        status: 'declined',
        accepted_at: new Date().toISOString() // Using this field to track when it was declined
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error declining invitation:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to decline invitation' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation declined successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Decline invitation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});