
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info, apikey-version, authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
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
    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    const accessToken = Deno.env.get('DOCUSIGN_JWT_TOKEN');
    const basePath = Deno.env.get('DOCUSIGN_BASE_PATH') || 'https://demo.docusign.net/restapi';

    if (!accountId || !accessToken) {
      return new Response(JSON.stringify({ error: 'DocuSign configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create signers array with current user as first signer
    const signers = [
      {
        email: signerEmail,
        name: signerName,
        recipientId: '1',
        routingOrder: '1',
        clientUserId: 'client_1',
        tabs: {
          signHereTabs: positions
            .filter((pos: any) => pos.email === signerEmail)
            .map((pos: any) => ({
              documentId: '1',
              pageNumber: pos.pageNumber,
              xPosition: pos.xPosition,
              yPosition: pos.yPosition
            }))
        }
      }
    ];

    // Add opposite party as second signer if they exist
    if (oppositeParty) {
      signers.push({
        email: oppositeParty.profiles.email,
        name: oppositeParty.profiles.name,
        recipientId: '2',
        routingOrder: '2',
        tabs: {
          signHereTabs: positions
            .filter((pos: any) => pos.email === oppositeParty.profiles.email)
            .map((pos: any) => ({
              documentId: '1',
              pageNumber: pos.pageNumber,
              xPosition: pos.xPosition,
              yPosition: pos.yPosition
            }))
        }
      });
    }

    const envelopeDefinition = {
      emailSubject: 'Please sign this document',
      documents: [{
        documentBase64: documentBase64,
        documentId: '1',
        fileExtension: 'pdf',
        name: 'Document to Sign',
      }],
      recipients: {
        signers: signers
      },
      status: 'sent',
    };

    console.log('Creating envelope with definition:', JSON.stringify(envelopeDefinition, null, 2));

    // Create envelope using direct HTTP call
    const createEnvelopeResponse = await fetch(`${basePath}/v2.1/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    });

    if (!createEnvelopeResponse.ok) {
      const errorText = await createEnvelopeResponse.text();
      console.error('Error creating envelope:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create envelope', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const envelopeResult = await createEnvelopeResponse.json();
    const envelopeId = envelopeResult.envelopeId;

    console.log('Envelope created successfully:', envelopeId);

    // Get the embedded signing URL
    const recipientViewRequest = {
      authenticationMethod: 'email',
      email: signerEmail,
      userName: signerName,
      clientUserId: 'client_1',
      returnUrl: `${supabaseUrl}/functions/v1/docusign-callback?envelopeId=${envelopeId}`
    };

    console.log('Requesting signing URL with:', JSON.stringify(recipientViewRequest, null, 2));

    const signingUrlResponse = await fetch(`${basePath}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipientViewRequest),
    });

    if (!signingUrlResponse.ok) {
      const errorText = await signingUrlResponse.text();
      console.error('Error getting signing URL:', errorText);
      
      // Check if envelope is already completed
      const envelopeStatusResponse = await fetch(`${basePath}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (envelopeStatusResponse.ok) {
        const envelopeStatus = await envelopeStatusResponse.json();
        if (envelopeStatus.status === 'completed') {
          return new Response(JSON.stringify({ completed: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Failed to get signing URL', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signingUrlResult = await signingUrlResponse.json();
    console.log('Signing URL obtained:', signingUrlResult.url);

    return new Response(JSON.stringify({ url: signingUrlResult.url }), {
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
