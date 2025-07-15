import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Background function to download signed document immediately  
async function downloadSignedDocumentImmediately(supabase: any, envelopeId: string, signature: any) {
  console.log('🚀 Starting immediate download for envelope:', envelopeId);
  
  try {
    // Get DocuSign tokens with more verbose logging
    const { data: tokens, error: tokenError } = await supabase
      .from('docusign_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      console.error('❌ Database error fetching DocuSign tokens:', tokenError);
      return;
    }

    if (!tokens) {
      console.error('❌ No DocuSign tokens found for immediate download');
      // Try to get count of tokens to debug
      const { count } = await supabase
        .from('docusign_tokens')
        .select('*', { count: 'exact', head: true });
      console.log('🔍 Total tokens in database:', count);
      return;
    }

    console.log('✅ Found DocuSign tokens for immediate download');
    console.log('🔑 Token expires at:', tokens.expires_at);
    console.log('🏢 Account ID:', tokens.account_id);
    console.log('🌐 Base URI:', tokens.base_uri);
    
    // Check if token is expired
    const expiresAt = new Date(tokens.expires_at);
    const now = new Date();
    if (expiresAt <= now) {
      console.error('❌ DocuSign token has expired at', expiresAt);
      return;
    }
    
    // Wait a moment to ensure envelope is ready (per DocuSign best practices)
    console.log('⏱️ Waiting 2 seconds for envelope to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Import DocuSign SDK
    const docusign = await import('https://esm.sh/docusign-esign@8.2.0');
    
    // Set up DocuSign API client
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(tokens.base_uri);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + tokens.access_token);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    
    // First check envelope status
    console.log('🔍 Checking envelope status before download...');
    const envelopeInfo = await envelopesApi.getEnvelope(tokens.account_id, envelopeId);
    console.log('📋 Envelope status:', envelopeInfo.status);
    
    if (envelopeInfo.status !== 'completed') {
      console.log('⚠️ Envelope not completed yet, status:', envelopeInfo.status);
      return;
    }
    
    // Download combined PDF immediately
    console.log('⚡ Immediate download attempt - Account:', tokens.account_id, 'Envelope:', envelopeId);
    
    const results = await envelopesApi.getDocument(tokens.account_id, envelopeId, 'combined', null);
    console.log('✅ Immediate download successful!');
    
    if (results) {
      // Convert the result to Uint8Array for storage
      const uint8Array = new Uint8Array(results);
      console.log(`📊 Downloaded document size: ${uint8Array.length} bytes`);
      
      // Get original document name
      const { data: originalDoc } = await supabase
        .from('documents')
        .select('name')
        .eq('id', signature.document_id)
        .single();
      
      const fileName = `SIGNED_${originalDoc?.name || 'document.pdf'}`;
      const filePath = `${signature.deal_id}/${fileName}`;
      
      console.log('💾 Immediate upload to storage - Path:', filePath);
      
      // Save to Signed Documents bucket immediately
      const { error: uploadError } = await supabase.storage
        .from('Signed Documents')
        .upload(filePath, uint8Array, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Immediate upload failed:', uploadError);
      } else {
        console.log('✅ Immediate upload successful! Document ready for download.');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Immediate download failed:', error.message);
    
    // More detailed error logging
    if (error.response) {
      console.error('📄 Error response status:', error.response.status);
      console.error('📄 Error response data:', error.response.data);
    }
    
    // If immediate download fails, log but don't throw to avoid breaking the webhook response
    if (error.response?.status === 404) {
      console.log('📄 Document not found during immediate download - envelope may not be ready or may have expired');
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
        
        // Start background task for immediate download
        EdgeRuntime.waitUntil(downloadSignedDocumentImmediately(supabase, webhookEnvelopeId, signature));
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