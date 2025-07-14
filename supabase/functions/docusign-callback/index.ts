import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple function to get access token (fall back to manual download if JWT fails)
async function getAccessToken(integrationKey: string, userId: string, privateKey: string, accountId: string): Promise<string | null> {
  console.log('Checking for existing access token in database...');
  
  // For now, we'll skip JWT and rely on existing OAuth tokens or manual download
  // The JWT implementation requires proper key formatting that's complex in edge functions
  console.log('JWT authentication skipped - will use manual download process');
  return null;
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
        
        // Try to download the signed document using JWT authentication
        try {
          console.log('Attempting to download signed document using JWT authentication');
          
          // Get DocuSign credentials from Supabase secrets
          const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
          const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
          const userId = Deno.env.get('DOCUSIGN_USER_ID');
          const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
          const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');

          if (!integrationKey || !userId || !accountId || !privateKey) {
            console.log('Missing DocuSign JWT credentials, document will be downloaded manually later');
          } else {
            // Get JWT access token
            const accessToken = await getAccessToken(integrationKey, userId, privateKey, accountId);
            
            if (!accessToken) {
              console.log('Failed to get JWT access token, document will be downloaded manually later');
            } else {
              console.log('Successfully obtained JWT access token');
              
              // Download the signed document from DocuSign
              const baseUri = 'https://demo.docusign.net'; // Use production URL: https://www.docusign.net
              const docuSignUrl = `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes/${webhookEnvelopeId}/documents/combined`;
              
              const docResponse = await fetch(docuSignUrl, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
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
                
                // Save to deal_documents bucket for proper access
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('deal_documents')
                  .upload(filePath, uint8Array, {
                    contentType: 'application/pdf',
                    upsert: true
                  });

                if (uploadError) {
                  console.error('Error uploading signed document:', uploadError);
                } else {
                  console.log('✅ Signed document saved to storage:', filePath);
                  
                  // Create a new document record for the signed version
                  const { data: newDoc, error: docError } = await supabase
                    .from('documents')
                    .insert({
                      name: fileName,
                      deal_id: signature.deal_id,
                      storage_path: filePath,
                      type: 'application/pdf',
                      size: uint8Array.length,
                      uploaded_by: signature.document_id, // Use original document ID as reference
                      status: 'signed',
                      category: 'signed_document'
                    })
                    .select()
                    .single();

                  if (docError) {
                    console.error('Error creating signed document record:', docError);
                  } else {
                    console.log('✅ Created signed document record in database');
                    
                    // Create a document version for the signed document
                    const { error: versionError } = await supabase
                      .from('document_versions')
                      .insert({
                        document_id: newDoc.id,
                        storage_path: filePath,
                        type: 'application/pdf',
                        size: uint8Array.length,
                        uploaded_by: signature.document_id,
                        version_number: 1,
                        description: 'Signed version'
                      });

                    if (versionError) {
                      console.error('Error creating document version:', versionError);
                    } else {
                      console.log('✅ Created document version for signed document');
                    }
                  }
                }
              } else {
                const errorText = await docResponse.text();
                console.error('Failed to download document from DocuSign:', errorText);
                console.error('Response status:', docResponse.status);
              }
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