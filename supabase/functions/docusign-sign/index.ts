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

    // Check if all required environment variables are present
    const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const userId = Deno.env.get('DOCUSIGN_USER_ID');
    const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    
    console.log('Environment variables check:', {
      integrationKey: integrationKey ? 'present' : 'missing',
      userId: userId ? 'present' : 'missing', 
      privateKey: privateKey ? 'present' : 'missing',
      accountId: accountId ? 'present' : 'missing'
    });

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
    console.log('=== Starting DocuSign JWT Authentication ===');
    console.log('Integration Key (partial):', integrationKey.substring(0, 8) + '...');
    console.log('User ID:', userId);
    console.log('Private Key length:', privateKey.length);
    
    // Validate inputs
    if (!integrationKey || !userId || !privateKey) {
      throw new Error('Missing required parameters for JWT authentication');
    }

    // Clean and format the private key according to DocuSign requirements
    let cleanPrivateKey = privateKey.trim();
    
    // Remove any Windows line endings and normalize
    cleanPrivateKey = cleanPrivateKey.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Ensure proper PEM format
    if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // If it's just the key content, wrap it properly
      cleanPrivateKey = `-----BEGIN PRIVATE KEY-----\n${cleanPrivateKey}\n-----END PRIVATE KEY-----`;
    }
    
    console.log('Private key format check passed');

    // Create JWT header (must be RS256 for DocuSign)
    const header = {
      "alg": "RS256",
      "typ": "JWT"
    };
    
    // Create JWT payload according to DocuSign specifications
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      "iss": integrationKey,          // Integration Key (Client ID)
      "sub": userId,                  // DocuSign User ID (GUID)
      "aud": "account-d.docusign.com", // DocuSign demo environment
      "iat": now,                     // Issued at
      "exp": now + 3600,              // Expires in 1 hour (max for DocuSign)
      "scope": "signature"            // Required scope for eSignature API
    };
    
    console.log('JWT payload:', { 
      iss: integrationKey.substring(0, 8) + '...', 
      sub: userId, 
      aud: payload.aud,
      iat: payload.iat, 
      exp: payload.exp,
      scope: payload.scope
    });
    
    // Base64URL encode header and payload
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const signatureData = `${encodedHeader}.${encodedPayload}`;
    console.log('JWT signature data prepared, length:', signatureData.length);
    
    // Extract key content and convert to DER format
    const pemContent = cleanPrivateKey
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s+/g, '')  // Remove all whitespace
      .trim();
    
    console.log('PEM content extracted, length:', pemContent.length);
    
    if (pemContent.length === 0) {
      throw new Error('Private key content is empty after processing');
    }
    
    // Decode base64 to get DER format (PKCS#8)
    let keyData: Uint8Array;
    try {
      const binaryString = atob(pemContent);
      keyData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        keyData[i] = binaryString.charCodeAt(i);
      }
      console.log('Key converted to DER format, byte length:', keyData.length);
    } catch (error) {
      throw new Error(`Failed to decode private key: ${error.message}`);
    }
    
    // Import private key using Web Crypto API
    let cryptoKey: CryptoKey;
    try {
      cryptoKey = await crypto.subtle.importKey(
        "pkcs8",  // PKCS#8 format required by DocuSign
        keyData,
        {
          name: "RSASSA-PKCS1-v1_5",  // Algorithm required by DocuSign
          hash: "SHA-256"             // Hash function for RS256
        },
        false,    // Not extractable
        ["sign"]  // Key usage
      );
      console.log('Private key imported successfully');
    } catch (error) {
      throw new Error(`Failed to import private key: ${error.message}. Make sure the key is in PKCS#8 format.`);
    }
    
    // Sign the JWT data
    let signature: ArrayBuffer;
    try {
      signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        new TextEncoder().encode(signatureData)
      );
      console.log('JWT signed successfully, signature length:', signature.byteLength);
    } catch (error) {
      throw new Error(`Failed to sign JWT: ${error.message}`);
    }
    
    // Base64URL encode the signature
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const jwt = `${signatureData}.${encodedSignature}`;
    console.log('JWT created successfully, total length:', jwt.length);
    
    // Exchange JWT for access token with DocuSign
    console.log('Requesting access token from DocuSign...');
    const authUrl = 'https://account-d.docusign.com/oauth/token';
    
    const tokenResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    console.log('DocuSign token response status:', tokenResponse.status);
    console.log('DocuSign token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    const responseText = await tokenResponse.text();
    console.log('DocuSign raw response:', responseText);
    
    if (!tokenResponse.ok) {
      console.error('DocuSign JWT authentication failed');
      console.error('Status:', tokenResponse.status, tokenResponse.statusText);
      console.error('Response body:', responseText);
      
      let errorMessage = `DocuSign JWT authentication failed: ${tokenResponse.status} ${tokenResponse.statusText}`;
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`;
          if (errorData.error_description) {
            errorMessage += `: ${errorData.error_description}`;
          }
        }
      } catch (e) {
        errorMessage += ` - ${responseText}`;
      }
      
      throw new Error(errorMessage);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse token response: ${error.message}`);
    }
    
    console.log('Token response parsed, keys:', Object.keys(tokenData));
    
    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received from DocuSign');
    }

    console.log('=== DocuSign JWT Authentication Successful ===');
    console.log('Access token received, expires in:', tokenData.expires_in, 'seconds');
    console.log('Token type:', tokenData.token_type);
    
    return tokenData.access_token;
    
  } catch (error) {
    console.error('=== DocuSign JWT Authentication Failed ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Re-throw with more context
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