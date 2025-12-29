import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// DocuSign API base URLs
const DOCUSIGN_AUTH_BASE_URL = 'https://account-d.docusign.com';
const DOCUSIGN_API_BASE_URL = 'https://demo.docusign.net/restapi';

// Cached JWT token
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * Get JWT access token for DocuSign API
 */
async function getJWTAccessToken(): Promise<string> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
  const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');

  if (!integrationKey || !userId || !privateKey || !accountId) {
    throw new Error('DocuSign not configured. Missing required environment variables.');
  }

  // Check cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.accessToken;
  }

  

  // Clean and format the private key
  let cleanPrivateKey = privateKey.trim();
  
  // Convert PKCS#1 to PKCS#8 if needed
  if (cleanPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    
    cleanPrivateKey = await convertPkcs1ToPkcs8(cleanPrivateKey);
  } else if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    cleanPrivateKey = `-----BEGIN PRIVATE KEY-----\n${cleanPrivateKey}\n-----END PRIVATE KEY-----`;
  }

  // Create JWT assertion
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: integrationKey,
    sub: userId,
    aud: 'account-d.docusign.com',
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation'
  };

  // Import private key and sign JWT
  const pemContent = cleanPrivateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
  const privateKeyObj = await jose.importPKCS8(cleanPrivateKey, 'RS256');
  
  const jwt = await new jose.SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKeyObj);

  // Exchange JWT for access token
  const tokenResponse = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token request failed:', tokenResponse.status, errorText);
    
    if (errorText.includes('consent_required')) {
      throw new Error(`CONSENT_REQUIRED: User consent is required.`);
    }
    
    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  
  // Cache the token
  cachedToken = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in * 1000)
  };


  return tokenData.access_token;
}

/**
 * Convert PKCS#1 to PKCS#8 format
 */
async function convertPkcs1ToPkcs8(pkcs1Key: string): Promise<string> {
  const keyContent = pkcs1Key
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryString = atob(keyContent);
  const pkcs1Data = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pkcs1Data[i] = binaryString.charCodeAt(i);
  }
  
  // RSA algorithm identifier
  const rsaAlgorithmId = new Uint8Array([
    0x30, 0x0d,
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00
  ]);
  
  const pkcs8Structure: number[] = [];
  pkcs8Structure.push(0x02, 0x01, 0x00);
  pkcs8Structure.push(...rsaAlgorithmId);
  
  const octetLength = encodeDerLength(pkcs1Data.length);
  pkcs8Structure.push(0x04, ...octetLength, ...pkcs1Data);
  
  const mainSeqLength = encodeDerLength(pkcs8Structure.length);
  const pkcs8Data = new Uint8Array([0x30, ...mainSeqLength, ...pkcs8Structure]);
  
  const base64String = btoa(String.fromCharCode(...pkcs8Data));
  return `-----BEGIN PRIVATE KEY-----\n${base64String.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
}

function encodeDerLength(length: number): number[] {
  if (length < 0x80) return [length];
  
  const bytes: number[] = [];
  let temp = length;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp = temp >> 8;
  }
  return [0x80 | bytes.length, ...bytes];
}

/**
 * Download document from DocuSign using REST API
 */
async function downloadDocumentFromDocuSign(
  accessToken: string,
  accountId: string,
  envelopeId: string,
  documentId: string = 'combined'
): Promise<Uint8Array> {

  // First check envelope status
  const statusResponse = await fetch(
    `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!statusResponse.ok) {
    const errorText = await statusResponse.text();
    console.error('Failed to get envelope status:', errorText);
    throw new Error(`Failed to get envelope status: ${statusResponse.status}`);
  }

  const envelopeInfo = await statusResponse.json();
  

  if (envelopeInfo.status !== 'completed') {
    throw new Error(`Envelope is not completed. Current status: ${envelopeInfo.status}`);
  }

  // Download the document
  const downloadResponse = await fetch(
    `${DOCUSIGN_API_BASE_URL}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/pdf'
      }
    }
  );

  if (!downloadResponse.ok) {
    const errorText = await downloadResponse.text();
    console.error('Failed to download document:', errorText);
    throw new Error(`Failed to download document: ${downloadResponse.status}`);
  }

  const arrayBuffer = await downloadResponse.arrayBuffer();
  const documentBytes = new Uint8Array(arrayBuffer);
  

  return documentBytes;

}
  serve(async (req: Request) => {
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID
    let currentUserId = '00000000-0000-0000-0000-000000000000';
    if (token) {
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data: { user } } = await userClient.auth.getUser();
      if (user?.id) {
        currentUserId = user.id;
      }
    }

    const { envelopeId, dealId, documentId = 'combined' } = await req.json();

    if (!envelopeId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: envelopeId and dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    

    // Step 1: Get DocuSign access token
    
    const accessToken = await getJWTAccessToken();
    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID') ?? '';

    // Step 2: Download document from DocuSign
    
    const documentBytes = await downloadDocumentFromDocuSign(
      accessToken,
      accountId,
      envelopeId,
      documentId
    );

    

    // Step 3: Get original document name
    const { data: signature } = await supabase
      .from('document_signatures')
      .select('document_id')
      .eq('envelope_id', envelopeId)
      .single();

    let fileName = 'signed_document.pdf';
    
    if (signature?.document_id) {
      const { data: originalDoc } = await supabase
        .from('documents')
        .select('name')
        .eq('id', signature.document_id)
        .single();
      
      if (originalDoc?.name) {
        // Ensure the signed file has .pdf extension
        const baseName = originalDoc.name.replace(/\.[^/.]+$/, '');
        fileName = `SIGNED_${baseName}.pdf`;
      }
    }

    // Step 4: Save to Supabase Storage
    
    const storagePath = `${dealId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, documentBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      throw new Error(`Failed to save document to storage: ${uploadError.message}`);
    }

    

    // Step 5: Create document record
    const { data: newDoc, error: createError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: fileName,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        status: 'signed',
        category: 'signed_contract',
        uploaded_by: currentUserId,
        version: 1
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create document record:', createError);
      throw new Error(`Failed to create document record: ${createError.message}`);
    }

    

    // Step 6: Create document version record
    const { error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: newDoc.id,
        version_number: 1,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        uploaded_by: currentUserId,
        description: 'Signed document downloaded from DocuSign'
      });

    if (versionError) {
      console.error('Warning: Failed to create version record:', versionError);
    }

    // Step 7: Update signature status
    await supabase
      .from('document_signatures')
      .update({ 
        status: 'completed',
        signed_at: new Date().toISOString()
      })
      .eq('envelope_id', envelopeId);

    

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signed document downloaded and added to Documents tab',
        document: {
          id: newDoc.id,
          name: fileName,
          size: documentBytes.length,
          envelope_id: envelopeId
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('DocuSign download error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Failed to download signed document from DocuSign'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
