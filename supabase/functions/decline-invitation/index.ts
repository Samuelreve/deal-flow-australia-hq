import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("CORS preflight request received");
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Decline invitation request received:", req.method);

  try {
    const { token } = await req.json();
    console.log("Token received:", token ? "present" : "missing");
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    console.log("Supabase URL:", SUPABASE_URL ? "present" : "missing");
    console.log("Service role key:", SUPABASE_SERVICE_ROLE_KEY ? "present" : "missing");
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get invitation details first
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('deal_invitations')
      .select('id, status, token_expires_at')
      .eq('invitation_token', token)
      .single();

    console.log("Invitation fetch result:", { invitation, fetchError });

    if (fetchError || !invitation) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid invitation token' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      console.log("Invitation status is not pending:", invitation.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Invitation is no longer pending' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation has expired
    if (invitation.token_expires_at && new Date(invitation.token_expires_at) < new Date()) {
      console.log("Invitation has expired");
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

    console.log("Update result:", { updateError });

    if (updateError) {
      console.error('Error declining invitation:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to decline invitation' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invitation declined successfully");
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
};

serve(handler);