
// Shared email utility functions for Edge Functions
import { generateInvitationEmail, generateParticipantAddedEmail, generateShareLinkEmail } from './email-templates.ts';

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

// Export template functions
export { generateInvitationEmail, generateParticipantAddedEmail, generateShareLinkEmail };
