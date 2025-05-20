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

// Generate share link email HTML
export function generateShareLinkEmail(params: {
  sharerName: string;
  dealTitle: string;
  documentName: string;
  shareUrl: string;
  customMessage?: string;
  expiresAt?: string | null;
  canDownload: boolean;
}): string {
  const { 
    sharerName, 
    dealTitle, 
    documentName, 
    shareUrl, 
    customMessage, 
    expiresAt,
    canDownload 
  } = params;
  
  const expiryInfo = expiresAt 
    ? `<p>This link will expire on ${new Date(expiresAt).toLocaleDateString()} at ${new Date(expiresAt).toLocaleTimeString()}.</p>` 
    : '<p>This link does not expire.</p>';
  
  const downloadInfo = canDownload
    ? '<p>You are allowed to download this document.</p>'
    : '<p>Downloading this document has been disabled by the sender.</p>';
    
  const customMessageSection = customMessage 
    ? `
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #4F46E5; background-color: #f9f9f9;">
        <p style="margin: 0; font-style: italic;">${customMessage}</p>
      </div>
    ` 
    : '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Secure Document Shared</h2>
      <p>Hello,</p>
      <p>${sharerName} has shared a document with you for the deal "${dealTitle}".</p>
      <p><strong>Document:</strong> ${documentName}</p>
      ${customMessageSection}
      <p>To view this document, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${shareUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Document
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${shareUrl}">${shareUrl}</a></p>
      ${expiryInfo}
      ${downloadInfo}
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        This is a secure link. Please do not forward this email to unauthorized individuals.
      </p>
      <p style="font-size: 12px; color: #666;">
        If you weren't expecting this document, please disregard this email.
      </p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        Regards,<br/>The Deal Pilot Team
      </p>
    </div>
  `;
}
