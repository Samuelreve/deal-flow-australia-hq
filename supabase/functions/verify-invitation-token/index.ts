
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the token from the request body
    const { token } = await req.json();
    
    if (!token) {
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

    // Verify the token and get invitation details
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("deal_invitations")
      .select(`
        id,
        invitee_email,
        invitee_role,
        created_at,
        status,
        deal_id,
        invited_by_user_id
      `)
      .eq("invitation_token", token)
      .single();

    if (invitationError || !invitation) {
      console.error("Invitation not found:", invitationError);
      return new Response(
        JSON.stringify({ error: "Invalid invitation token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation is already used
    if (invitation.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "This invitation has already been used or cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get inviter's name and deal title for display
    const [inviterResult, dealResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("name").eq("id", invitation.invited_by_user_id).single(),
      supabaseAdmin.from("deals").select("title").eq("id", invitation.deal_id).single()
    ]);

    return new Response(
      JSON.stringify({
        dealId: invitation.deal_id,
        inviteeEmail: invitation.invitee_email,
        inviteeRole: invitation.invitee_role,
        dealTitle: dealResult.data?.title || "Unknown Deal",
        inviterName: inviterResult.data?.name || "Someone",
        status: "valid"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying invitation token:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
