
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://wntmgfuclbdrezxcvzmw.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudG1nZnVjbGJkcmV6eGN2em13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDQ1MzMsImV4cCI6MjA2MDc4MDUzM30.B6_rR0UtjgKvwdsRqEcyLl9jh_aT51XrZm17XtqMm0g";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface InviteRequest {
  dealId: string;
  inviteeEmail: string;
  inviteeRole: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the JWT token from the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Create authenticated Supabase client using the user's JWT
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    
    // Create service role client for privileged operations
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get the authenticated user from their JWT
    const { data: { user: authenticatedUser }, error: userError } = 
      await supabaseClient.auth.getUser(token);
    
    if (userError || !authenticatedUser) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { dealId, inviteeEmail, inviteeRole } = await req.json() as InviteRequest;
    
    // Input validation
    if (!dealId || !inviteeEmail || !inviteeRole) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteeEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate role
    const validRoles = ["buyer", "lawyer", "admin"];
    if (!validRoles.includes(inviteeRole)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be one of: buyer, lawyer, admin" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Prevent inviting yourself
    if (inviteeEmail.toLowerCase() === authenticatedUser.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "You cannot invite yourself to a deal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the authenticated user is a participant in the deal
    const { data: participantData, error: participantError } = await supabaseClient
      .from("deal_participants")
      .select("role")
      .eq("deal_id", dealId)
      .eq("user_id", authenticatedUser.id)
      .single();
    
    if (participantError || !participantData) {
      console.error("Participant check error:", participantError);
      return new Response(
        JSON.stringify({ error: "You are not a participant in this deal" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the authenticated user has permission to invite (only seller and admin can)
    if (participantData.role !== "seller" && participantData.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only sellers and admins can invite participants" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the deal exists and get its status
    const { data: dealData, error: dealError } = await supabaseClient
      .from("deals")
      .select("status")
      .eq("id", dealId)
      .single();
    
    if (dealError || !dealData) {
      console.error("Deal fetch error:", dealError);
      return new Response(
        JSON.stringify({ error: "Deal not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if invitations are allowed for current deal status
    if (dealData.status !== "draft" && dealData.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Invitations are only allowed for draft or active deals" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if user with this email already exists (requires service role)
    const { data: existingUsers, error: existingUserError } = await supabaseAdmin.auth
      .admin
      .listUsers();
    
    if (existingUserError) {
      console.error("Error checking existing users:", existingUserError);
      return new Response(
        JSON.stringify({ error: "Error checking existing users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const existingUser = existingUsers.users.find(
      u => u.email?.toLowerCase() === inviteeEmail.toLowerCase()
    );
    
    if (existingUser) {
      // Check if the existing user is already a participant
      const { data: existingParticipant, error: existingParticipantError } = await supabaseClient
        .from("deal_participants")
        .select("id")
        .eq("deal_id", dealId)
        .eq("user_id", existingUser.id)
        .single();
      
      if (!existingParticipantError && existingParticipant) {
        return new Response(
          JSON.stringify({ error: "User is already a participant in this deal" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Check if there's an existing invitation for this email and deal
    const { data: existingInvitation, error: invitationError } = await supabaseClient
      .from("deal_invitations")
      .select("id, status")
      .eq("deal_id", dealId)
      .eq("invitee_email", inviteeEmail.toLowerCase())
      .eq("status", "pending")
      .single();
    
    if (!invitationError && existingInvitation) {
      return new Response(
        JSON.stringify({ error: "An invitation has already been sent to this email" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use the built-in Supabase function to create the invitation
    const { data: inviteResult, error: inviteError } = await supabaseClient.rpc(
      'create_deal_invitation',
      {
        p_deal_id: dealId,
        p_invitee_email: inviteeEmail.toLowerCase(),
        p_invitee_role: inviteeRole
      }
    );

    if (inviteError) {
      console.error("Invitation creation error:", inviteError);
      return new Response(
        JSON.stringify({ error: inviteError.message || "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the success response from the RPC function
    return new Response(
      JSON.stringify(inviteResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
