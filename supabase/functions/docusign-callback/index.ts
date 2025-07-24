import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Background function removed - user can manually download signed documents

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
      } else if (webhookEvent === 'envelope-completed' || webhookEvent === 'signing_complete' || webhookStatus === 'completed') {
        newStatus = 'completed';
      } else if (webhookEvent === 'recipient-completed') {
        newStatus = 'completed';
      }
      
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
      console.log('✅ Document signing completed. User can now manually download the signed document.');
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
    const baseUrl = 'https://preview--deal-flow-australia-hq.lovable.app';
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