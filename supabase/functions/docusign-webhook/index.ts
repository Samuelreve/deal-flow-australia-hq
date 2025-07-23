import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocuSignWebhookData {
  event: string;
  apiVersion: string;
  uri: string;
  retryCount: number;
  configurationId: string;
  generatedDateTime: string;
  data: {
    accountId: string;
    userId: string;
    envelopeId: string;
    envelopeSummary: {
      status: string;
      documentsUri: string;
      recipientsUri: string;
      attachmentsUri: string;
      envelopeUri: string;
      envelopeId: string;
      customFieldsUri: string;
      notificationUri: string;
      enableWetSign: string;
      allowMarkup: string;
      allowReassign: string;
      createdDateTime: string;
      lastModifiedDateTime: string;
      deliveredDateTime?: string;
      sentDateTime?: string;
      completedDateTime?: string;
      declinedDateTime?: string;
      statusChangedDateTime: string;
      documentsCombinedUri: string;
      certificateUri: string;
      templatesUri: string;
      expireEnabled: string;
      expireDateTime?: string;
      expireAfter: string;
      sender: {
        userName: string;
        email: string;
        userId: string;
      };
      recipients: {
        signers: Array<{
          name: string;
          email: string;
          recipientId: string;
          recipientIdGuid: string;
          status: string;
          completedCount: string;
          deliveredDateTime?: string;
          sentDateTime?: string;
          declinedDateTime?: string;
          declinedReason?: string;
          deliveryMethod: string;
          totalTabCount: string;
          recipientType: string;
        }>;
      };
    };
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== DocuSign Webhook Received ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let webhookData: DocuSignWebhookData;
    try {
      webhookData = await req.json();
      console.log('Webhook Data:', JSON.stringify(webhookData, null, 2));
    } catch (error) {
      console.error('Failed to parse webhook JSON:', error);
      return new Response('Invalid JSON payload', { status: 400, headers: corsHeaders });
    }

    const { event, data } = webhookData;
    const { envelopeId, envelopeSummary } = data;
    
    console.log(`Processing event: ${event} for envelope: ${envelopeId}`);
    console.log(`Envelope status: ${envelopeSummary.status}`);

    // Get the signature record for this envelope
    const { data: signature, error: sigError } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (sigError || !signature) {
      console.error('Signature record not found for envelope:', envelopeId, sigError);
      return new Response('Signature record not found', { status: 404, headers: corsHeaders });
    }

    console.log('Found signature record:', signature);

    // Update signature status based on envelope status
    let newStatus = signature.status; // Keep existing status as default
    let updateData: any = { updated_at: new Date().toISOString() };

    switch (envelopeSummary.status.toLowerCase()) {
      case 'sent':
        newStatus = 'sent';
        break;
      case 'delivered':
        newStatus = 'delivered';
        break;
      case 'completed':
        newStatus = 'completed';
        updateData.signed_at = new Date().toISOString();
        break;
      case 'declined':
        newStatus = 'declined';
        break;
      case 'voided':
        newStatus = 'voided';
        break;
    }

    // Update the signature record
    if (newStatus !== signature.status) {
      updateData.status = newStatus;
      
      const { error: updateError } = await supabase
        .from('document_signatures')
        .update(updateData)
        .eq('envelope_id', envelopeId);

      if (updateError) {
        console.error('Error updating signature status:', updateError);
        return new Response('Database update failed', { status: 500, headers: corsHeaders });
      }

      console.log(`✅ Signature status updated from ${signature.status} to ${newStatus}`);
    }

    // Handle specific events
    switch (event) {
      case 'envelope-sent':
        console.log('📤 Envelope sent to recipients');
        break;
      case 'envelope-delivered':
        console.log('📬 Envelope delivered to recipients');
        break;
      case 'envelope-completed':
        console.log('✅ Envelope completed - all signatures collected');
        await handleEnvelopeCompleted(supabase, signature.deal_id, envelopeId);
        break;
      case 'envelope-declined':
        console.log('❌ Envelope declined by recipient');
        break;
      case 'envelope-voided':
        console.log('🚫 Envelope voided');
        break;
      case 'recipient-completed':
        console.log('✅ Individual recipient completed signing');
        await handleRecipientCompleted(supabase, webhookData, signature);
        break;
      default:
        console.log(`📋 Unhandled event: ${event}`);
    }

    // Send realtime notification to frontend
    await sendRealtimeUpdate(supabase, signature.deal_id, {
      type: 'signature_status_updated',
      envelopeId,
      status: newStatus,
      event,
      timestamp: new Date().toISOString()
    });

    return new Response('Webhook processed successfully', { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleEnvelopeCompleted(supabase: any, dealId: string, envelopeId: string) {
  console.log(`📋 Processing completed envelope for deal: ${dealId}`);
  
  // Check if all required signatures are now complete for this deal
  const { data: allSignatures, error } = await supabase
    .from('document_signatures')
    .select('*')
    .eq('deal_id', dealId);

  if (error) {
    console.error('Error checking all signatures:', error);
    return;
  }

  const completedSignatures = allSignatures?.filter(sig => sig.status === 'completed') || [];
  const totalSignatures = allSignatures?.length || 0;
  
  console.log(`Signatures status: ${completedSignatures.length}/${totalSignatures} completed`);

  // Check if this was for a milestone
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('deal_id', dealId)
    .eq('milestone_type', 'document_signing')
    .eq('status', 'in_progress');

  if (milestones && milestones.length > 0) {
    console.log('📄 Found document signing milestones to potentially update');
    
    // If all signatures complete, the milestone can be marked as ready for completion
    if (completedSignatures.length === totalSignatures) {
      console.log('✅ All signatures completed - milestone ready for completion');
    }
  }
}

async function handleRecipientCompleted(supabase: any, webhookData: DocuSignWebhookData, signature: any) {
  const recipients = webhookData.data.envelopeSummary.recipients?.signers || [];
  
  for (const recipient of recipients) {
    if (recipient.status === 'completed') {
      console.log(`✅ Recipient ${recipient.email} (${recipient.name}) completed signing`);
    }
  }
}

async function sendRealtimeUpdate(supabase: any, dealId: string, payload: any) {
  try {
    // Send real-time update to subscribers of this deal
    const channel = supabase.channel(`deal_${dealId}`);
    await channel.send({
      type: 'broadcast',
      event: 'signature_update',
      payload
    });
    
    console.log('📡 Sent realtime update to frontend');
  } catch (error) {
    console.error('Failed to send realtime update:', error);
  }
}