import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { generateDocumentSignedEmail } from "../_shared/email-templates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "Trustroom.ai <notifications@resend.dev>",
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Email sending failed:", errorBody);
      return false;
    }
    
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

async function notifyParticipants(
  supabase: any,
  dealId: string,
  signerEmail: string,
  documentName: string,
  dealTitle: string
) {
  console.log('📧 Notifying participants for deal:', dealId);
  
  // Get all deal participants with their profiles and notification settings
  const { data: participants, error: participantsError } = await supabase
    .from('deal_participants')
    .select(`
      user_id,
      profiles!deal_participants_user_id_fkey (
        id,
        name,
        email
      )
    `)
    .eq('deal_id', dealId);

  if (participantsError) {
    console.error('Error fetching participants:', participantsError);
    return;
  }

  if (!participants || participants.length === 0) {
    console.log('No participants found for deal');
    return;
  }

  console.log(`Found ${participants.length} participants to notify`);

  const baseUrl = 'https://deal-flow-australia-hq.lovable.app';
  const dealUrl = `${baseUrl}/deals/${dealId}`;
  
  // Get signer name from email (best effort)
  const signerName = signerEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  for (const participant of participants) {
    const profile = participant.profiles;
    if (!profile) continue;

    const userId = profile.id;
    const recipientName = profile.name || 'there';
    const recipientEmail = profile.email;

    // 1. Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        deal_id: dealId,
        title: 'Document Signed',
        message: `${signerName} has signed "${documentName}"`,
        type: 'success',
        category: 'deal_update',
        link: `/deals/${dealId}`
      });

    if (notifError) {
      console.error(`Error creating notification for ${userId}:`, notifError);
    } else {
      console.log(`✅ In-app notification created for ${recipientName}`);
    }

    // 2. Check if user wants email notifications for deal updates
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('email_deal_updates')
      .eq('user_id', userId)
      .single();

    // Default to true if no settings found
    const emailEnabled = settings?.email_deal_updates ?? true;

    if (emailEnabled && recipientEmail) {
      const emailHtml = generateDocumentSignedEmail({
        recipientName,
        signerName,
        documentName,
        dealTitle,
        dealUrl
      });

      await sendEmail(
        recipientEmail,
        `Document Signed: ${documentName} - ${dealTitle}`,
        emailHtml
      );
    } else {
      console.log(`📧 Email notifications disabled for ${recipientName}`);
    }
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log the full request details
    console.log('=== DocuSign Webhook Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Get query parameters
    const url = new URL(req.url);
    const event = url.searchParams.get('event');
    const envelopeId = url.searchParams.get('envelopeId');
    const dealId = url.searchParams.get('dealId');
    
    console.log('Query Parameters:', { event, envelopeId, dealId });

    // Try to read request body if it exists
    let requestBody = null;
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      }
    } catch (e) {
      console.log('No JSON body or parsing failed:', e.message);
    }

    // Log document and status information if available
    if (requestBody) {
      if (requestBody.status) {
        console.log('🔄 Document Status:', requestBody.status);
      }
      if (requestBody.envelopeId || requestBody.envelope_id) {
        console.log('📄 Envelope ID:', requestBody.envelopeId || requestBody.envelope_id);
      }
      if (requestBody.documents) {
        console.log('📁 Documents:', requestBody.documents);
      }
      if (requestBody.recipients) {
        console.log('👥 Recipients:', requestBody.recipients);
      }
    }

    console.log('=== End Webhook Data ===');

    // Handle webhook events and check if it's from request body
    let webhookEvent = event;
    let webhookEnvelopeId = envelopeId;
    let webhookStatus = null;
    let redirectDealId = dealId;
    
    if (requestBody && requestBody.event) {
      webhookEvent = requestBody.event;
      webhookEnvelopeId = requestBody.data?.envelopeId || requestBody.envelopeId;
      webhookStatus = requestBody.data?.envelopeSummary?.status || requestBody.status;
    }

    console.log('Processing webhook:', { webhookEvent, webhookEnvelopeId, webhookStatus });

    // Update signature status based on webhook event
    if (webhookEnvelopeId) {
      console.log('🔍 Looking up deal ID for envelope:', webhookEnvelopeId);
      
      let newStatus = 'pending'; // default
      
      // Handle various DocuSign webhook events
      if (webhookEvent === 'recipient-sent' || webhookEvent === 'recipient-delivered' || webhookStatus === 'sent') {
        newStatus = 'sent';
      } else if (webhookEvent === 'sign_completed' || webhookEvent === 'recipient-completed') {
        newStatus = 'partially_completed'; // Individual recipient completed
      } else if (webhookEvent === 'envelope_completed' || webhookStatus === 'completed') {
        newStatus = 'completed'; // Full envelope completed
      }
      
      console.log(`📋 Setting signature status to: ${newStatus} for envelope: ${webhookEnvelopeId}`);
      
      // Update signature status
      const { error: statusError } = await supabase
        .from('document_signatures')
        .update({ 
          status: newStatus,
          ...(newStatus === 'completed' ? { signed_at: new Date().toISOString() } : {})
        })
        .eq('envelope_id', webhookEnvelopeId);

      if (statusError) {
        console.error('Error updating signature status:', statusError);
      } else {
        console.log(`✅ Signature status updated to: ${newStatus}`);
      }
      
      // Get the deal ID from the signature record for redirect
      const { data: signature, error: sigError } = await supabase
        .from('document_signatures')
        .select('deal_id')
        .eq('envelope_id', webhookEnvelopeId)
        .single();
        
      if (!sigError && signature) {
        console.log('📋 Found deal ID from signature:', signature.deal_id);
        redirectDealId = signature.deal_id;
      }
    }

    if ((webhookEvent === 'envelope-completed' || webhookStatus === 'completed') && webhookEnvelopeId) {
      console.log('📝 Processing completed signing for envelope:', webhookEnvelopeId);
      console.log('🔍 Webhook event:', webhookEvent, 'Status:', webhookStatus);
      
      // Get document and deal details for notification
      const { data: signatureData } = await supabase
        .from('document_signatures')
        .select(`
          signer_email,
          deal_id,
          documents (name),
          deals:deal_id (title)
        `)
        .eq('envelope_id', webhookEnvelopeId)
        .single();

      if (signatureData && signatureData.deal_id) {
        const documentName = signatureData.documents?.name || 'Document';
        const dealTitle = signatureData.deals?.title || 'Deal';
        const signerEmail = signatureData.signer_email;

        console.log(`📄 Document: ${documentName}, Deal: ${dealTitle}, Signer: ${signerEmail}`);

        // Notify all participants
        await notifyParticipants(
          supabase,
          signatureData.deal_id,
          signerEmail,
          documentName,
          dealTitle
        );
      }
      
      console.log('✅ Document signing completed and participants notified.');
    }

    // Get the deal ID for redirect (already set above or from URL param)
    if (!redirectDealId && envelopeId) {
      const { data: signature } = await supabase
        .from('document_signatures')
        .select('deal_id')
        .eq('envelope_id', envelopeId)
        .single();
      redirectDealId = signature?.deal_id;
    }

    // Determine redirect URL - redirect to deal details page
    const baseUrl = 'https://deal-flow-australia-hq.lovable.app';
    const redirectUrl = redirectDealId 
      ? `${baseUrl}/deals/${redirectDealId}`
      : `${baseUrl}`;
      
    console.log('🔄 Redirecting to:', redirectUrl);

    // Redirect immediately to the documents tab
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });

  } catch (error: any) {
    console.error('DocuSign callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});