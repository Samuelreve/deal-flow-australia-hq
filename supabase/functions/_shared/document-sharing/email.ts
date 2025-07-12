
import { sendEmail } from '../email.ts';
import { ShareLinkData, DocumentInfo, DealInfo, UserInfo } from './types.ts';

// Generate HTML content for the share link email
export const generateShareLinkEmail = ({
  sharerName,
  dealTitle,
  documentName,
  shareUrl,
  customMessage,
  expiresAt,
  canDownload
}: {
  sharerName: string;
  dealTitle: string;
  documentName: string;
  shareUrl: string;
  customMessage?: string;
  expiresAt?: string | null;
  canDownload: boolean;
}): string => {
  const expiryInfo = expiresAt 
    ? `<p>This link will expire on ${new Date(expiresAt).toLocaleDateString()}.</p>` 
    : '';
  
  const downloadInfo = canDownload
    ? '<p>You can download a copy of this document.</p>'
    : '<p>This is a view-only link. You cannot download the document.</p>';
  
  const messageSection = customMessage
    ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #1E66F5; border-radius: 4px;">
        <p style="margin: 0; font-style: italic;">"${customMessage}"</p>
      </div>
    `
    : '';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Document Shared With You</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E66F5; padding: 20px; color: white; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #1E66F5; color: white; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Document Shared With You</h2>
        </div>
        <div class="content">
          <p><strong>${sharerName}</strong> has shared a document with you from Trustroom.ai.</p>
          
          <h3>Document Details</h3>
          <p><strong>Deal:</strong> ${dealTitle}</p>
          <p><strong>Document:</strong> ${documentName}</p>
          
          ${messageSection}
          
          <p>${downloadInfo}</p>
          ${expiryInfo}
          
          <a href="${shareUrl}" class="button">View Document</a>
          
          <div class="footer">
            <p>This is an automated message from Trustroom.ai. If you received this by mistake, please ignore it.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Send share link emails to recipients
export const sendShareLinkEmails = async (
  shareLink: ShareLinkData,
  documentInfo: DocumentInfo,
  dealInfo: DealInfo,
  sharerInfo: UserInfo,
  recipients: string[],
  customMessage?: string
): Promise<{ all_successful: boolean; details: Array<{ recipient: string; success: boolean; error?: string }> }> => {
  const sharerName = sharerInfo.name || 'A Trustroom.ai user';
  const results = [];
  let allSuccessful = true;
  
  for (const recipient of recipients) {
    try {
      const emailHtml = generateShareLinkEmail({
        sharerName,
        dealTitle: dealInfo.title || 'Untitled Deal',
        documentName: documentInfo.name || 'Document',
        shareUrl: shareLink.share_url || '',
        customMessage,
        expiresAt: shareLink.expires_at,
        canDownload: shareLink.can_download
      });
      
      await sendEmail({
        to: recipient,
        subject: `Secure Document Shared: ${documentInfo.name}`,
        html: emailHtml,
        from: "Trustroom.ai <notifications@trustroom.ai>"
      });
      
      results.push({
        recipient,
        success: true
      });
    } catch (error) {
      console.error(`Error sending email to ${recipient}:`, error);
      results.push({
        recipient,
        success: false,
        error: error.message || 'Failed to send email'
      });
      allSuccessful = false;
    }
  }
  
  return {
    all_successful: allSuccessful,
    details: results
  };
};
