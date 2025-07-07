
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";
import { Resend } from "npm:resend@2.0.0";
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
  try {
    const { dealId, inviteeEmail, inviteeRole } = await req.json() as InviteRequest;
    
    // Basic validation
    if (!dealId || !inviteeEmail || !inviteeRole) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase clients
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://dbb615e3-5c6f-4cda-8adc-2b52f782b9f3.lovableproject.com";
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
    });
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get current user from Authorization header
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

    // Prevent self-invitation
    if (inviteeEmail.toLowerCase() === user.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "You cannot invite yourself to a deal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify permissions and get deal data
    const participantData = await verifyDealParticipation(supabaseClient, dealId, user.id);
    const dealData = await verifyDealStatus(supabaseClient, dealId);
    
    // Check if user already exists
    const existingUser = await findExistingUser(supabaseAdmin, inviteeEmail);
    
    // Get inviter profile
    const inviterProfile = await getInviterProfile(supabaseClient, user.id);
    const inviterName = inviterProfile?.name || user.email || "A participant";

    if (existingUser) {
      // Check if already a participant
      const isExistingParticipant = await checkExistingParticipant(supabaseClient, dealId, existingUser.id);
      
      if (isExistingParticipant) {
        return new Response(
          JSON.stringify({ error: "User is already a participant in this deal" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add existing user as participant
      await addExistingUserAsParticipant(supabaseAdmin, dealId, existingUser.id, inviteeRole);
      
      // Send notification email using Resend
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      const dealUrl = `${APP_BASE_URL}/deals/${dealId}`;
      
      try {
        await resend.emails.send({
          from: "dealpilot@resend.dev",
          to: [inviteeEmail],
          subject: `You've been added to deal "${dealData.title}"`,
          html: `
            <h1>You've been added to a deal!</h1>
            <p>Hi there,</p>
            <p><strong>${inviterName}</strong> has added you as a <strong>${inviteeRole}</strong> to the deal "<strong>${dealData.title}</strong>".</p>
            <p>You can access the deal here: <a href="${dealUrl}">${dealUrl}</a></p>
            <p>Best regards,<br>The DealPilot Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Existing user has been added to the deal"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check for existing invitation
    const existingInvitation = await checkExistingInvitation(supabaseClient, dealId, inviteeEmail);
    
    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: "An invitation has already been sent to this email" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create invitation
    const inviteResult = await createInvitation(supabaseClient, dealId, inviteeEmail, inviteeRole, user.id);
    const invitationUrl = `${APP_BASE_URL}/accept-invite?token=${inviteResult.token}`;

    // Send invitation email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    try {
      await resend.emails.send({
        from: "DealPilot <onboarding@resend.dev>",
        to: [inviteeEmail],
        subject: `Invitation to join deal "${dealData.title}"`,
        html: `
          <h1>You're invited to join a deal!</h1>
          <p>Hi there,</p>
          <p><strong>${inviterName}</strong> has invited you to join the deal "<strong>${dealData.title}</strong>" as a <strong>${inviteeRole}</strong>.</p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
          <p>Or copy and paste this URL into your browser: ${invitationUrl}</p>
          <p>This invitation will expire in 7 days.</p>
          <p>Best regards,<br>The DealPilot Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
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
    console.error("Handler error:", error);
    
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
