import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    if (requestBody && requestBody.event) {
      webhookEvent = requestBody.event;
      webhookEnvelopeId = requestBody.data?.envelopeId || requestBody.envelopeId;
      webhookStatus = requestBody.data?.envelopeSummary?.status || requestBody.status;
    }

    console.log('Processing webhook:', { webhookEvent, webhookEnvelopeId, webhookStatus });

    // Update signature status based on webhook event
    if (webhookEnvelopeId) {
      let newStatus = 'pending'; // default
      
      if (webhookEvent === 'recipient-delivered' || webhookStatus === 'sent') {
        newStatus = 'delivered';
      } else if (webhookEvent === 'signing_complete' || webhookEvent === 'envelope-completed' || webhookStatus === 'completed') {
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
    }

    if ((webhookEvent === 'signing_complete' || webhookEvent === 'envelope-completed' || webhookStatus === 'completed') && webhookEnvelopeId) {
      console.log('📝 Processing completed signing for envelope:', webhookEnvelopeId);
      
      // Get the signature record to retrieve document and deal info
      const { data: signature, error: sigError } = await supabase
        .from('document_signatures')
        .select('document_id, deal_id')
        .eq('envelope_id', webhookEnvelopeId)
        .single();

      if (sigError || !signature) {
        console.error('Error finding signature record:', sigError);
      } else {
        console.log('Found signature record:', signature);
        
        // Try to download the signed document directly from DocuSign
        try {
          // Get DocuSign tokens
          const { data: tokens, error: tokenError } = await supabase
            .from('docusign_tokens')
            .select('*')
            .single();

          if (tokenError || !tokens) {
            console.log('No DocuSign tokens found, document will be downloaded manually later');
          } else {
            console.log('Found DocuSign tokens, attempting to download signed document');
            
            // Download the signed document from DocuSign
            const docuSignUrl = `${tokens.base_uri}/restapi/v2.1/accounts/${tokens.account_id}/envelopes/${webhookEnvelopeId}/documents/combined`;
            
            const docResponse = await fetch(docuSignUrl, {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Accept': 'application/pdf'
              }
            });

            if (docResponse.ok) {
              const pdfBuffer = await docResponse.arrayBuffer();
              const uint8Array = new Uint8Array(pdfBuffer);
              
              // Get original document name
              const { data: originalDoc } = await supabase
                .from('documents')
                .select('name')
                .eq('id', signature.document_id)
                .single();
              
              const fileName = `SIGNED_${originalDoc?.name || 'document.pdf'}`;
              const filePath = `${signature.deal_id}/${fileName}`;
              
              // Save to signed_document bucket (not auto-download)
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('signed_document')
                .upload(filePath, uint8Array, {
                  contentType: 'application/pdf',
                  upsert: true
                });

              if (uploadError) {
                console.error('Error uploading signed document:', uploadError);
              } else {
                console.log('✅ Signed document saved to storage:', filePath);
                console.log('Document will be available for manual download via button');
              }
            } else {
              console.error('Failed to download document from DocuSign:', await docResponse.text());
            }
          }
        } catch (downloadError) {
          console.error('Error downloading signed document:', downloadError);
        }
      }

      // Status was already updated above, no need to update again
    }

    // Get the deal ID for redirect (from signature record or URL param)
    let redirectDealId = dealId;
    if (!redirectDealId && envelopeId) {
      const { data: signature } = await supabase
        .from('document_signatures')
        .select('deal_id')
        .eq('envelope_id', envelopeId)
        .single();
      redirectDealId = signature?.deal_id;
    }

    // Determine redirect URL - redirect directly to documents tab
    const baseUrl = 'https://preview--deal-flow-australia-hq.lovable.app';
    const redirectUrl = redirectDealId 
      ? `${baseUrl}/deals/${redirectDealId}?tab=documents&signed=true`
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