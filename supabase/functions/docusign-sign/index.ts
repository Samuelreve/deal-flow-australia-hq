import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocuSignRequest {
  documentId: string;
  dealId: string;
  signerEmail: string;
  signerName: string;
  signerRole: 'buyer' | 'seller';
}

interface EnvelopeRecipient {
  email: string;
  name: string;
  recipientId: string;
  routingOrder: string;
}

interface EnvelopeDocument {
  documentBase64: string;
  documentId: string;
  fileExtension: string;
  name: string;
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

    const { documentId, dealId, signerEmail, signerName, signerRole }: DocuSignRequest = await req.json();

    console.log('DocuSign request:', { documentId, dealId, signerEmail, signerName, signerRole });

    // Get document details from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Get deal participants to determine who should receive the document
    const { data: participants, error: participantsError } = await supabase
      .from('deal_participants')
      .select('user_id, role, profiles!inner(name, email)')
      .eq('deal_id', dealId);

    if (participantsError) {
      throw new Error('Failed to get deal participants');
    }

    // Find the opposite party to send for signing
    const oppositeRole = signerRole === 'buyer' ? 'seller' : 'buyer';
    const oppositeParty = participants.find(p => p.role === oppositeRole);

    if (!oppositeParty) {
      throw new Error(`No ${oppositeRole} found for this deal`);
    }

    // Download document from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('deal_documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      throw new Error('Failed to download document');
    }

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Get DocuSign access token
    const accessToken = await getDocuSignAccessToken();

    // Create envelope for signing
    const envelope = await createDocuSignEnvelope({
      document: {
        documentBase64: base64,
        documentId: '1',
        fileExtension: document.type.split('/')[1] || 'pdf',
        name: document.name
      },
      signers: [
        {
          email: signerEmail,
          name: signerName,
          recipientId: '1',
          routingOrder: '1'
        },
        {
          email: oppositeParty.profiles.email,
          name: oppositeParty.profiles.name,
          recipientId: '2',
          routingOrder: '2'
        }
      ],
      accessToken
    });

    // Get signing URL for the first signer
    const signingUrl = await getSigningUrl(envelope.envelopeId, '1', accessToken);

    // Store envelope information in database
    await supabase
      .from('document_signatures')
      .insert({
        document_id: documentId,
        deal_id: dealId,
        envelope_id: envelope.envelopeId,
        signer_email: signerEmail,
        signer_role: signerRole,
        status: 'sent'
      });

    return new Response(
      JSON.stringify({
        success: true,
        signingUrl,
        envelopeId: envelope.envelopeId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('DocuSign signing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getDocuSignAccessToken(): Promise<string> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');

  if (!integrationKey || !clientSecret || !userId) {
    throw new Error('DocuSign credentials not configured');
  }

  const authString = btoa(`${integrationKey}:${clientSecret}`);
  
  const response = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: await createJWT(integrationKey, userId)
    })
  });

  const tokenData = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${tokenData.error_description}`);
  }

  return tokenData.access_token;
}

async function createJWT(integrationKey: string, userId: string): Promise<string> {
  // For production, you'd implement proper JWT creation with RSA keys
  // For now, we'll use a simplified approach
  // Note: This is a placeholder - real implementation requires RSA key pair
  throw new Error('JWT creation not implemented - requires RSA key pair setup');
}

async function createDocuSignEnvelope(params: {
  document: EnvelopeDocument;
  signers: EnvelopeRecipient[];
  accessToken: string;
}): Promise<{ envelopeId: string }> {
  const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
  
  if (!accountId) {
    throw new Error('DocuSign account ID not configured');
  }

  const envelopeDefinition = {
    emailSubject: 'Please sign this document',
    documents: [params.document],
    recipients: {
      signers: params.signers.map(signer => ({
        ...signer,
        tabs: {
          signHereTabs: [{
            documentId: '1',
            pageNumber: '1',
            xPosition: '100',
            yPosition: '100'
          }]
        }
      }))
    },
    status: 'sent'
  };

  const response = await fetch(
    `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envelopeDefinition)
    }
  );

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to create envelope: ${result.message}`);
  }

  return { envelopeId: result.envelopeId };
}

async function getSigningUrl(envelopeId: string, recipientId: string, accessToken: string): Promise<string> {
  const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
  
  const response = await fetch(
    `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        returnUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-callback`,
        authenticationMethod: 'None',
        recipientId
      })
    }
  );

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get signing URL: ${result.message}`);
  }

  return result.url;
}