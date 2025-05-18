
// Shared email utility functions for Edge Functions

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from: string;
}

// Function to send email using Resend API
export async function sendEmail(config: EmailConfig) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
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

// Generate invitation email HTML
export function generateInvitationEmail(params: {
  inviterName: string;
  dealTitle: string;
  inviteeRole: string;
  invitationUrl: string;
}): string {
  const { inviterName, dealTitle, inviteeRole, invitationUrl } = params;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Deal Invitation</h2>
      <p>Hello,</p>
      <p>${inviterName} has invited you to join the deal "${dealTitle}" as a ${inviteeRole}.</p>
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
}

// Generate participant added email HTML
export function generateParticipantAddedEmail(params: {
  inviterName: string;
  dealTitle: string;
  inviteeRole: string;
  dealUrl: string;
}): string {
  const { inviterName, dealTitle, inviteeRole, dealUrl } = params;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">You've Been Added to a Deal</h2>
      <p>Hello,</p>
      <p>${inviterName} has added you to the deal "${dealTitle}" as a ${inviteeRole}.</p>
      <p>You can access this deal by logging into your DealPilot account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dealUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Deal
        </a>
      </div>
      <p>Regards,<br/>The Deal Pilot Team</p>
    </div>
  `;
}
