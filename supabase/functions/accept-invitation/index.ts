
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    
    if (!invitationToken) {
      return new Response(
        JSON.stringify({ error: "Invitation token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase URL and service role key from environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Create a Supabase client with the service role key for admin access
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get authenticated user from token
    const user = await getAuthenticatedUser(token);
    
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
    
    // Get invitation details
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("deal_invitations")
      .select("*")
      .eq("invitation_token", invitationToken)
      .single();
    
    if (invitationError || !invitation) {
      console.error("Invitation not found:", invitationError);
      return new Response(
        JSON.stringify({ error: "Invalid invitation token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "This invitation has already been used or cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Optional: Check if email matches the invitation (uncomment to enforce)
    const userEmail = user.email || profile.email;
    if (userEmail.toLowerCase() !== invitation.invitee_email.toLowerCase()) {
      console.warn(`Email mismatch: Invitation for ${invitation.invitee_email}, but user is ${userEmail}`);
      // Either disallow (return error) or just log the warning and continue
      // return new Response(
      //   JSON.stringify({ error: "This invitation was sent to a different email address" }),
      //   { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      // );
    }
    
    // Check if user is already a participant in the deal
    const { count: existingParticipantCount, error: participantCheckError } = await supabaseAdmin
      .from("deal_participants")
      .select("*", { count: 'exact', head: true })
      .eq("deal_id", invitation.deal_id)
      .eq("user_id", user.id);
    
    if (participantCheckError) {
      console.error("Error checking existing participation:", participantCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing participation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (existingParticipantCount > 0) {
      return new Response(
        JSON.stringify({ error: "You are already a participant in this deal" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Transaction: Add the user as a participant and update the invitation status
    const { data: acceptResult, error: transactionError } = await supabaseAdmin.rpc("accept_invitation", {
      p_token: invitationToken,
      p_user_id: user.id
    });
    
    if (transactionError) {
      console.error("Transaction error:", transactionError);
      
      // Handle specific error codes for better frontend error handling
      let errorMessage = transactionError.message || "Failed to accept invitation";
      let statusCode = 500;
      
      if (transactionError.code === '22007') {
        errorMessage = "This invitation has expired. Please request a new invitation.";
        statusCode = 410; // Gone - resource no longer available
      } else if (transactionError.code === '22000') {
        errorMessage = "Invalid or already used invitation token.";
        statusCode = 404;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, errorCode: transactionError.code }),
        { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract result data
    const result = acceptResult?.[0];
    if (!result?.success) {
      return new Response(
        JSON.stringify({ error: "Failed to accept invitation" }),
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
          title: "Invitation Accepted",
          message: `${userEmail} has accepted your invitation to join the deal`,
          type: "info",
          link: `/deals/${invitation.deal_id}`
        }
      ]);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        dealId: result.deal_id,
        inviteeRole: result.invitee_role
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
