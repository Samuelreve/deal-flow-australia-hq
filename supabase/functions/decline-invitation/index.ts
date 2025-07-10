import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("CORS preflight request received");
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Decline invitation request received:", req.method);

  try {
    // Get the auth token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Get the invitation token from the request body
    const { token: invitationToken } = await req.json();
    console.log("Invitation token received:", invitationToken ? "present" : "missing");
    
    if (!invitationToken) {
      return new Response(
        JSON.stringify({ error: "Invitation token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase URL and service role key from environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    console.log("Supabase URL:", SUPABASE_URL ? "present" : "missing");
    console.log("Service role key:", SUPABASE_SERVICE_ROLE_KEY ? "present" : "missing");
    
    // Create a Supabase client with the service role key for admin access
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get authenticated user from token
    const user = await getAuthenticatedUser(token);
    console.log("Authenticated user:", user.id);

    // Get invitation details first
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('deal_invitations')
      .select('id, status, token_expires_at, invitee_email, invited_by_user_id, deal_id')
      .eq('invitation_token', invitationToken)
      .single();

    console.log("Invitation fetch result:", { invitation, fetchError });

    if (fetchError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invalid invitation token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      console.log("Invitation status is not pending:", invitation.status);
      return new Response(
        JSON.stringify({ error: "This invitation has already been used or cancelled" }),
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
        JSON.stringify({ error: "Invitation has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's email from the auth database or profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: Check if email matches the invitation (log warning but allow decline)
    const userEmail = user.email || profile.email;
    if (userEmail.toLowerCase() !== invitation.invitee_email.toLowerCase()) {
      console.warn(`Email mismatch: Invitation for ${invitation.invitee_email}, but user is ${userEmail}`);
      // Allow decline regardless of email mismatch - user might be declining on behalf of someone
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
        JSON.stringify({ error: 'Failed to decline invitation' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a notification for the inviter
    await supabaseAdmin
      .from("notifications")
      .insert([
        {
          user_id: invitation.invited_by_user_id,
          deal_id: invitation.deal_id,
          title: "Invitation Declined",
          message: `${userEmail} has declined your invitation to join the deal`,
          type: "info",
          link: `/deals/${invitation.deal_id}`
        }
      ]);

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

serve(handler);