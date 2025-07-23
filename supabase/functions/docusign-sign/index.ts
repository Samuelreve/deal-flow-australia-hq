import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';
import * as docusign from 'https://esm.sh/docusign-esign@6.3.0';
import { Buffer } from 'https://deno.land/std@0.177.0/io/buffer.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info, apikey-version, authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { url, method, headers } = req;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: headers.get('Authorization')! },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { dealId, positions, documentBase64, oppositeParty } = body;

    if (!dealId || !positions || !documentBase64) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signerEmail = profile.email;
    const signerName = profile.name;

    // Create signers array with current user as first signer
    const signers = [
      {
        email: signerEmail,
        name: signerName,
        recipientId: '1', // Current user should be first
        routingOrder: '1' // Current user signs first
      }
    ];

    // Add opposite party as second signer if they exist
    if (oppositeParty) {
      signers.push({
        email: oppositeParty.profiles.email,
        name: oppositeParty.profiles.name,
        recipientId: '2',
        routingOrder: '2' // Opposite party signs second
      });
    }

    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(Deno.env.get('DOCUSIGN_BASE_PATH') || '');
    apiClient.addDefaultHeader('Authorization', `Bearer ${Deno.env.get('DOCUSIGN_JWT_TOKEN')}`);

    const pdfBytes = Uint8Array.from(atob(documentBase64), c => c.charCodeAt(0));

    const document = {
      documentBase64: btoa(String.fromCharCode(...pdfBytes)),
      documentId: '1',
      fileExtension: 'pdf',
      name: 'Example Document',
    };

    const envelopeDefinition = {
      accountId: accountId,
      emailSubject: 'Please sign this document',
      documents: [document],
      recipients: {
        signers: signers.map(signer => ({
          email: signer.email,
          name: signer.name,
          recipientId: signer.recipientId,
          routingOrder: signer.routingOrder,
          // Set clientUserId only for the current user (first signer)
          clientUserId: signer.recipientId === '1' ? `client_${signer.recipientId}` : undefined,
          tabs: {
            signHereTabs: positions
              .filter(pos => pos.email === signer.email)
              .map(pos => ({
                documentId: '1',
                pageNumber: pos.pageNumber,
                xPosition: pos.xPosition,
                yPosition: pos.yPosition
              }))
          }
        }))
      },
      status: 'sent',
    };

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    let envelopeSummary;
    try {
      envelopeSummary = await envelopesApi.createEnvelope(accountId, envelopeDefinition);
      console.log('Envelope created:', envelopeSummary);
    } catch (error) {
      console.error('Error creating envelope:', error);
      throw error;
    }

    const envelopeId = envelopeSummary.envelopeId;

    const getSigningUrl = async (envelopeId: string) => {
      console.log('Requesting signing URL from DocuSign...');
      console.log('Envelope ID:', envelopeId);
      console.log('API Base Path:', apiClient.getBasePath());
      console.log('Account ID:', accountId);
      
      const recipientViewRequest = {
        authenticationMethod: 'email',
        email: signerEmail,
        userName: signerName,
        clientUserId: 'client_1', // Always use client_1 for current user
        returnUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-callback?envelopeId=${envelopeId}`
      };

      console.log('Recipient view request:', recipientViewRequest);

      // Step 5: Get the embedded signing URL from DocuSign
      try {
        const viewUrl = await envelopesApi.createRecipientView(accountId, envelopeId, recipientViewRequest);
        console.log('Signing URL:', viewUrl.url);
        return viewUrl.url;
      } catch (error) {
        console.error('Error getting signing URL:', error);

        // Check if the envelope is completed
        const envelope = await envelopesApi.getEnvelope(accountId, envelopeId);
        if (envelope.status === 'completed') {
          console.warn('Envelope is already completed.');
          return null;
        }

        throw error;
      }
    };

    const signingUrl = await getSigningUrl(envelopeId);

    if (!signingUrl) {
      return new Response(JSON.stringify({ completed: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: signingUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
