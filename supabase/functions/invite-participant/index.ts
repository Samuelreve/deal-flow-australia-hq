
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase clients
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://wntmgfuclbdrezxcvzmw.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudG1nZnVjbGJkcmV6eGN2em13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDQ1MzMsImV4cCI6MjA2MDc4MDUzM30.B6_rR0UtjgKvwdsRqEcyLl9jh_aT51XrZm17XtqMm0g";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "http://localhost:5173";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@dealpilot.com";

interface InviteRequest {
  dealId: string;
  inviteeEmail: string;
  inviteeRole: string;
}

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from: string;
}

// Function to send email using Resend API
async function sendEmail(config: EmailConfig) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      subject: config.subject,
      html: config.html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Email sending failed:", errorBody);
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- 1. Authentication ---
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
    const requestBody = await req.json();
    const { dealId, inviteeEmail, inviteeRole } = requestBody as InviteRequest;
    
    // --- 2. Validation ---
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

    // --- 3. Authorization (RBAC) ---
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
    
    // --- 4. Deal Status Check ---
    // Check if the deal exists and get its status
    const { data: dealData, error: dealError } = await supabaseClient
      .from("deals")
      .select("status, title")
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
    
    // --- 5. Check Existing User ---
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
    
    // --- 6. Get inviter profile info for email ---
    const { data: inviterProfile, error: inviterProfileError } = await supabaseClient
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", authenticatedUser.id)
      .single();

    if (inviterProfileError) {
      console.error("Error fetching inviter profile:", inviterProfileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch inviter profile information" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const inviterName = inviterProfile?.name || authenticatedUser.email || "A participant";

    if (existingUser) {
      // --- 7a. Check if existing user is already a participant ---
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

      // --- 7b. Process existing user ---
      // For existing users, we'll directly add them to deal_participants
      const { data: newParticipant, error: addParticipantError } = await supabaseAdmin
        .from("deal_participants")
        .insert([
          {
            deal_id: dealId,
            user_id: existingUser.id,
            role: inviteeRole
          }
        ])
        .select("*")
        .single();
      
      if (addParticipantError) {
        console.error("Error adding existing user as participant:", addParticipantError);
        return new Response(
          JSON.stringify({ error: "Failed to add user as participant" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      try {
        // Create email HTML content for existing user
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You've Been Added to a Deal</h2>
            <p>Hello,</p>
            <p>${inviterName} has added you to the deal "${dealData.title}" as a ${inviteeRole}.</p>
            <p>You can access this deal by logging into your DealPilot account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_BASE_URL}/deals/${dealId}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Deal
              </a>
            </div>
            <p>Regards,<br/>The Deal Pilot Team</p>
          </div>
        `;

        // Send the notification email
        if (RESEND_API_KEY) {
          await sendEmail({
            to: inviteeEmail,
            subject: `You've been added to deal "${dealData.title}"`,
            html: emailHtml,
            from: `DealPilot <${SENDER_EMAIL}>`
          });
        }
      } catch (emailError) {
        console.error("Email sending error for existing user:", emailError);
        // Continue since the user has already been added
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Existing user has been added to the deal",
          participant: newParticipant
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    
    // --- 8. Create invitation ---
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

    // --- 9. Send invitation email ---
    // Get the token from the invitation result
    const invitationToken = inviteResult.token;
    if (!invitationToken) {
      console.error("No invitation token returned");
      return new Response(
        JSON.stringify({ error: "Failed to generate invitation token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct invitation URL
    const invitationUrl = `${APP_BASE_URL}/accept-invite?token=${invitationToken}`;

    try {
      // Create email HTML content
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Deal Invitation</h2>
          <p>Hello,</p>
          <p>${inviterName} has invited you to join the deal "${dealData.title}" as a ${inviteeRole}.</p>
          <p>To accept this invitation, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${invitationUrl}">${invitationUrl}</a></p>
          <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
          <p>Regards,<br/>The Deal Pilot Team</p>
        </div>
      `;

      // Send the invitation email
      if (RESEND_API_KEY) {
        await sendEmail({
          to: inviteeEmail,
          subject: `Invitation to join deal "${dealData.title}"`,
          html: emailHtml,
          from: `DealPilot <${SENDER_EMAIL}>`
        });
      } else {
        // Log that no email was sent due to missing API key
        console.warn("Email not sent: RESEND_API_KEY is not configured");
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // We'll still return success since the invitation was created
      // But we'll include a note about the email failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invitation created but email could not be sent. Please check your email configuration.", 
          invitationCreated: true,
          emailSent: false
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully", 
        invitationCreated: true,
        emailSent: true
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
