
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail, generateInvitationEmail, generateParticipantAddedEmail } from "../_shared/email.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { validateInviteRequest } from "../_shared/validation.ts";
import { 
  InviteRequest, 
  InvitationResult,
  verifyDealParticipation,
  verifyDealStatus,
  findExistingUser,
  getInviterProfile,
  checkExistingParticipant,
  checkExistingInvitation,
  addExistingUserAsParticipant,
  createInvitation
} from "./invitation-service.ts";

export async function handleInvitation(req: Request): Promise<Response> {
  // --- 1. Parse and Validate Request ---
  const requestBody = await req.json() as InviteRequest;
  
  const validation = validateInviteRequest(requestBody);
  if (!validation.isValid) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  const { dealId, inviteeEmail, inviteeRole } = validation;

  // --- 2. Authentication ---
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  const token = authHeader.split(" ")[1];

  try {
    // Get env variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://wntmgfuclbdrezxcvzmw.supabase.co";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudG1nZnVjbGJkcmV6eGN2em13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDQ1MzMsImV4cCI6MjA2MDc4MDUzM30.B6_rR0UtjgKvwdsRqEcyLl9jh_aT51XrZm17XtqMm0g";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "http://localhost:5173";
    const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@dealpilot.com";
    
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
    const authenticatedUser = await getAuthenticatedUser(token);
    
    // Prevent inviting yourself
    if (inviteeEmail.toLowerCase() === authenticatedUser.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "You cannot invite yourself to a deal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // --- 3. Authorization (RBAC) ---
    const participantData = await verifyDealParticipation(supabaseClient, dealId, authenticatedUser.id);
    
    // --- 4. Deal Status Check ---
    const dealData = await verifyDealStatus(supabaseClient, dealId);
    
    // --- 5. Check Existing User ---
    const existingUser = await findExistingUser(supabaseAdmin, inviteeEmail);
    
    // --- 6. Get inviter profile info for email ---
    const inviterProfile = await getInviterProfile(supabaseClient, authenticatedUser.id);
    const inviterName = inviterProfile?.name || authenticatedUser.email || "A participant";

    if (existingUser) {
      // --- 7a. Check if existing user is already a participant ---
      const isExistingParticipant = await checkExistingParticipant(
        supabaseClient, 
        dealId, 
        existingUser.id
      );
      
      if (isExistingParticipant) {
        return new Response(
          JSON.stringify({ error: "User is already a participant in this deal" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // --- 7b. Process existing user ---
      const newParticipant = await addExistingUserAsParticipant(
        supabaseAdmin,
        dealId,
        existingUser.id,
        inviteeRole
      );
      
      try {
        // Send notification email to existing user
        const dealUrl = `${APP_BASE_URL}/deals/${dealId}`;
        const emailHtml = generateParticipantAddedEmail({
          inviterName,
          dealTitle: dealData.title,
          inviteeRole,
          dealUrl
        });

        await sendEmail({
          to: inviteeEmail,
          subject: `You've been added to deal "${dealData.title}"`,
          html: emailHtml,
          from: `DealPilot <${SENDER_EMAIL}>`
        });
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
    const existingInvitation = await checkExistingInvitation(
      supabaseClient,
      dealId,
      inviteeEmail
    );
    
    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: "An invitation has already been sent to this email" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // --- 8. Create invitation ---
    const inviteResult = await createInvitation(
      supabaseClient,
      dealId,
      inviteeEmail,
      inviteeRole
    );

    // --- 9. Send invitation email ---
    const invitationToken = inviteResult.token;
    if (!invitationToken) {
      return new Response(
        JSON.stringify({ error: "Failed to generate invitation token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct invitation URL
    const invitationUrl = `${APP_BASE_URL}/accept-invite?token=${invitationToken}`;

    try {
      // Create email HTML content
      const emailHtml = generateInvitationEmail({
        inviterName,
        dealTitle: dealData.title,
        inviteeRole,
        invitationUrl
      });

      // Send the invitation email
      await sendEmail({
        to: inviteeEmail,
        subject: `Invitation to join deal "${dealData.title}"`,
        html: emailHtml,
        from: `DealPilot <${SENDER_EMAIL}>`
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // We'll still return success since the invitation was created
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
    if (error instanceof Error) {
      const errorMessage = error.message || "Unknown error";
      console.error("Handler error:", errorMessage);
      
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("invalid token")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
