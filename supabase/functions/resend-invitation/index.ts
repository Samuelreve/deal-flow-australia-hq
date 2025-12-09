import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const { invitationId, dealId } = await req.json();
    
    if (!invitationId || !dealId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const APP_BASE_URL = "https://deal-flow-australia-hq.lovable.app";
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
    });
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is authenticated
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

    // Verify user is a participant in the deal
    const { data: participantData, error: participantError } = await supabaseClient
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (participantError || !participantData) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to manage invitations for this deal" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('deal_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('deal_id', dealId)
      .single();

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: "Can only resend pending invitations" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new token and expiry
    const newToken = crypto.randomUUID();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update the invitation with new token
    const { error: updateError } = await supabaseAdmin
      .from('deal_invitations')
      .update({
        invitation_token: newToken,
        token_expires_at: newExpiresAt.toISOString()
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get deal info for email
    const { data: deal } = await supabaseClient
      .from('deals')
      .select('title')
      .eq('id', dealId)
      .single();

    // Get inviter profile
    const { data: inviterProfile } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();

    const inviterName = inviterProfile?.name || user.email || "A participant";
    const invitationUrl = `${APP_BASE_URL}/accept-invite?token=${newToken}`;

    // Send email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    console.log("Resending invitation email to:", invitation.invitee_email);

    try {
      await resend.emails.send({
        from: "Trustroom.ai <noreply@trustroom.ai>",
        to: [invitation.invitee_email],
        subject: `Reminder: Invitation to join deal "${deal?.title || 'Untitled'}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Reminder: You're Invited!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterName}</strong> has invited you to join the deal 
                <strong>"${deal?.title || 'Untitled'}"</strong> as a <strong>${invitation.invitee_role}</strong>.
              </p>
              <p style="font-size: 16px; margin-bottom: 25px;">
                This is a reminder that your invitation is still pending. Click the button below to accept.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">
                This invitation will expire in 7 days. If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </div>
            <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">
              © ${new Date().getFullYear()} Trustroom.ai. All rights reserved.
            </p>
          </body>
          </html>
        `,
        text: `Hello,

${inviterName} has invited you to join the deal "${deal?.title || 'Untitled'}" as a ${invitation.invitee_role}.

This is a reminder that your invitation is still pending.

To accept this invitation, please visit: ${invitationUrl}

This invitation will expire in 7 days. If you weren't expecting this invitation, you can safely ignore this email.

Regards,
The Trustroom.ai Team`
      });
      
      console.log("Resend email sent successfully");
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Still return success since invitation was updated
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invitation updated but email could not be sent",
          emailSent: false
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation resent successfully",
        emailSent: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
