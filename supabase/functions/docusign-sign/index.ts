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
  console.log('=== DocuSign Function Started ===');
  console.log('Request method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Parsing request body...');
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
    // Try different bucket names since there are multiple buckets
    let fileData = null;
    let downloadError = null;
    
    const buckets = ['deal_documents', 'Deal Documents', 'Documents', 'contracts'];
    
    for (const bucket of buckets) {
      // Try both with and without deal ID prefix in the path
      const possiblePaths = [
        document.storage_path, // Original path
        `${dealId}/${document.storage_path}` // Path with deal ID prefix
      ];
      
      for (const path of possiblePaths) {
        console.log(`Trying to download from bucket: ${bucket}, path: ${path}`);
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(path);
        
        if (!error && data) {
          fileData = data;
          console.log(`Successfully downloaded from bucket: ${bucket}, path: ${path}`);
          break;
        } else {
          console.log(`Failed to download from bucket ${bucket}, path ${path}:`, error?.message);
          downloadError = error;
        }
      }
      
      if (fileData) break;
    }

    if (!fileData) {
      console.error('Failed to download document from any bucket. Last error:', downloadError);
      throw new Error(`Failed to download document from any bucket. Last error: ${JSON.stringify(downloadError)}`);
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
    console.error('DocuSign signing error occurred:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message, details: error.name }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getDocuSignAccessToken(): Promise<string> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');

  if (!integrationKey || !userId || !privateKey) {
    throw new Error('DocuSign credentials not configured');
  }

  // Use JWT Grant
  return await getJWTAccessToken(integrationKey, userId, privateKey);
}

async function getJWTAccessToken(integrationKey: string, userId: string, privateKey: string): Promise<string> {
  try {
    console.log('Attempting DocuSign JWT authentication with integration key:', integrationKey.substring(0, 8) + '...');
    
    // Create JWT header
    const header = {
      "alg": "RS256",
      "typ": "JWT"
    };
    
    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      "iss": integrationKey,
      "sub": userId,
      "aud": "account-d.docusign.com",
      "iat": now,
      "exp": now + 3600, // 1 hour expiration
      "scope": "signature"
    };
    
    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/[+\/=]/g, (m) => ({"+":"-", "/":"_", "=":""}[m] || m));
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+\/=]/g, (m) => ({"+":"-", "/":"_", "=":""}[m] || m));
    
    // Create signature data
    const signatureData = `${encodedHeader}.${encodedPayload}`;
    
    // Import private key and sign
    const keyData = new TextEncoder().encode(privateKey);
    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(signatureData)
    );
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[+\/=]/g, (m) => ({"+":"-", "/":"_", "=":""}[m] || m));
    
    const jwt = `${signatureData}.${encodedSignature}`;
    
    console.log('JWT created, requesting access token...');
    
    // Exchange JWT for access token
    const authUrl = 'https://account-d.docusign.com/oauth/token';
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    console.log('DocuSign JWT auth response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSign JWT authentication failed. Status:', response.status);
      console.error('DocuSign JWT error details:', errorData);
      throw new Error(`DocuSign JWT authentication failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    console.log('DocuSign JWT auth response keys:', Object.keys(data));
    
    if (!data.access_token) {
      console.error('No access token in JWT response:', data);
      throw new Error('No access token received from DocuSign JWT');
    }

    console.log('Successfully obtained DocuSign JWT access token, expires in:', data.expires_in, 'seconds');
    return data.access_token;
    
  } catch (error) {
    console.error('JWT authentication failed:', error);
    throw new Error(`DocuSign JWT authentication failed: ${error.message}`);
  }
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