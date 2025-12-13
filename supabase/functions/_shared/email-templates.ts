
// Email template generation functions

// Generate invitation email HTML
export function generateInvitationEmail(params: {
  inviterName: string;
  dealTitle: string;
  inviteeRole: string;
  invitationUrl: string;
}): string {
  const { inviterName, dealTitle, inviteeRole, invitationUrl } = params;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deal Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 30px; text-align: center; background-color: #4F46E5;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Deal Invitation</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">Hello,</p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                    <strong>${inviterName}</strong> has invited you to join the deal "<strong>${dealTitle}</strong>" as a <strong>${inviteeRole}</strong>.
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                    To accept this invitation, please click the button below:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${invitationUrl}" style="display: inline-block; padding: 15px 30px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 30px 0 20px 0; font-size: 14px; line-height: 1.5; color: #666666;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.5; color: #4F46E5; word-break: break-all;">
                    ${invitationUrl}
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #666666;">
                    If you weren't expecting this invitation, you can safely ignore this email.
                  </p>
                  <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.5; color: #333333;">
                    Regards,<br/>
                    The Deal Pilot Team
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
        Regards,<br/>The Trustroom.ai Team
      </p>
    </div>
  `;
}

// Generate document signed email HTML
export function generateDocumentSignedEmail(params: {
  recipientName: string;
  signerName: string;
  documentName: string;
  dealTitle: string;
  dealUrl: string;
}): string {
  const { recipientName, signerName, documentName, dealTitle, dealUrl } = params;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Signed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 30px; text-align: center; background-color: #10B981;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">✓ Document Signed</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">Hello ${recipientName},</p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                    Great news! <strong>${signerName}</strong> has signed the document "<strong>${documentName}</strong>" for the deal "<strong>${dealTitle}</strong>".
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; color: #333333;">
                    You can view the signed document and deal progress by clicking the button below:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${dealUrl}" style="display: inline-block; padding: 15px 30px; background-color: #10B981; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Deal</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.5; color: #333333;">
                    Regards,<br/>
                    The Trustroom.ai Team
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
