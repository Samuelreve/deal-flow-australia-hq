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
      
      if (webhookEvent === 'recipient-sent' || webhookStatus === 'sent') {
        newStatus = 'sent';
      } else if (webhookEvent === 'envelope-completed' || webhookStatus === 'completed') {
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

    if ((webhookEvent === 'envelope-completed' || webhookStatus === 'completed') && webhookEnvelopeId) {
      console.log('📝 Processing completed signing for envelope:', webhookEnvelopeId);
      console.log('🔍 Webhook event:', webhookEvent, 'Status:', webhookStatus);
      
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
        
        // Try to download the signed document using DocuSign SDK
        try {
          // Get DocuSign tokens
          const { data: tokens, error: tokenError } = await supabase
            .from('docusign_tokens')
            .select('*')
            .single();

          if (tokenError || !tokens) {
            console.error('❌ No DocuSign tokens found:', tokenError);
            console.log('Document will be downloaded manually later');
          } else {
            console.log('✅ Found DocuSign tokens, attempting to download signed document using SDK');
            console.log('🔑 Token details - Account ID:', tokens.account_id, 'Base URI:', tokens.base_uri);
            
            // Import DocuSign SDK
            console.log('📦 Importing DocuSign SDK...');
            const docusign = await import('https://esm.sh/docusign-esign@8.2.0');
            console.log('✅ DocuSign SDK imported successfully');
            
            // Set up DocuSign API client
            console.log('🔧 Setting up DocuSign API client...');
            let dsApiClient = new docusign.ApiClient();
            dsApiClient.setBasePath(tokens.base_uri);
            dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + tokens.access_token);
            let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
            console.log('✅ DocuSign API client configured');
            
            // Download combined PDF with all signed documents
            console.log('📥 Downloading signed document - Account:', tokens.account_id, 'Envelope:', webhookEnvelopeId);
            const results = await envelopesApi.getDocument(tokens.account_id, webhookEnvelopeId, 'combined', null);
            console.log('📄 Document download result type:', typeof results, 'Length:', results?.length || 'undefined');
            
            if (results) {
              console.log('📥 Document download successful, processing...');
              
              // Convert the result to Uint8Array for storage
              console.log('🔄 Converting results to Uint8Array...');
              const uint8Array = new Uint8Array(results);
              console.log(`📊 Document size: ${uint8Array.length} bytes`);
              
              // Get original document name
              console.log('📋 Getting original document name...');
              const { data: originalDoc, error: docError } = await supabase
                .from('documents')
                .select('name')
                .eq('id', signature.document_id)
                .single();
              
              if (docError) {
                console.error('❌ Error getting original document:', docError);
              } else {
                console.log('✅ Original document found:', originalDoc?.name);
              }
              
              const fileName = `SIGNED_${originalDoc?.name || 'document.pdf'}`;
              const filePath = `${signature.deal_id}/${fileName}`;
              
              console.log('💾 Uploading to storage...');
              console.log('📁 Bucket: Signed Documents');
              console.log('📄 File path:', filePath);
              console.log('📊 File size:', uint8Array.length, 'bytes');
              
              // Save to Signed Documents bucket
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('Signed Documents')
                .upload(filePath, uint8Array, {
                  contentType: 'application/pdf',
                  upsert: true
                });

              if (uploadError) {
                console.error('❌ Error uploading signed document:', uploadError);
                console.error('❌ Upload error details:', JSON.stringify(uploadError, null, 2));
              } else {
                console.log('✅ Signed document saved to storage successfully!');
                console.log('📁 Storage path:', filePath);
                console.log('📋 Upload data:', uploadData);
                console.log('🎯 Document will be available for manual download via button');
              }
            } else {
              console.error('❌ No document data received from DocuSign SDK');
              console.error('❌ Results value:', results);
            }
          }
        } catch (downloadError) {
          console.error('Error downloading signed document with SDK:', downloadError);
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