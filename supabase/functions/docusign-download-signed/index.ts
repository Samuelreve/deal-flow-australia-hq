import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Import DocuSign SDK using default export pattern for Deno
const docusign = await import('npm:docusign-esign@8.2.0');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// DocuSign OAuth endpoints
const DOCUSIGN_AUTH_BASE_URL = 'https://account-d.docusign.com';

// Store DocuSign token data (OAuth-based)
let docusignTokenData: {
  access_token: string;
  refresh_token?: string;
  account_id: string;
  base_uri: string;
  expires_at: number;
  user_info: DocuSignUserInfo;
} | null = null;

// Legacy configuration support
let docusignConfig: {
  integrationKey: string;
  userId: string;
  privateKey: string;
  accountId: string;
  accessToken?: string;
  tokenExpiresAt?: number;
} | null = null;

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface DocuSignUserInfo {
  sub: string;
  name: string;
  email: string;
  accounts: Array<{
    account_id: string;
    account_name: string;
    is_default: boolean;
    base_uri: string;
  }>;
}

async function getDocuSignAccessToken(): Promise<{ access_token: string; base_uri: string; account_id: string }> {
  console.log('🔐 Getting DocuSign access token...');
  
  // First try OAuth token if available
  const oauthToken = await getValidAccessToken();
  if (oauthToken && docusignTokenData) {
    console.log('✅ Using OAuth access token');
    return {
      access_token: oauthToken,
      base_uri: docusignTokenData.base_uri,
      account_id: docusignTokenData.account_id
    };
  }

  // Fall back to JWT authentication using DocuSign SDK
  console.log('🔐 Falling back to JWT authentication...');
  
  // Auto-configure from environment variables
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
  const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');

  if (!integrationKey || !userId || !privateKey || !accountId) {
    throw new Error('DocuSign not configured. Missing required environment variables: DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_PRIVATE_KEY, DOCUSIGN_ACCOUNT_ID');
  }

  if (!docusignConfig) {
    docusignConfig = {
      integrationKey,
      userId,
      privateKey,
      accountId
    };
  }

  // Check if we have a valid cached JWT token
  if (docusignConfig.accessToken && 
      docusignConfig.tokenExpiresAt && 
      Date.now() < docusignConfig.tokenExpiresAt - 300000) { // 5 minutes buffer
    console.log('✅ Using cached JWT access token');
    return {
      access_token: docusignConfig.accessToken,
      base_uri: 'https://demo.docusign.net',
      account_id: docusignConfig.accountId
    };
  }

  // Get new token using DocuSign SDK
  console.log('🔐 Getting new JWT access token using DocuSign SDK...');
  const accessToken = await getJWTAccessTokenWithSDK(
    docusignConfig.integrationKey,
    docusignConfig.userId,
    docusignConfig.privateKey,
    docusignConfig.accountId
  );

  // Cache the token (expires in 1 hour)
  docusignConfig.accessToken = accessToken;
  docusignConfig.tokenExpiresAt = Date.now() + (3600 * 1000); // 1 hour

  return {
    access_token: accessToken,
    base_uri: 'https://demo.docusign.net',
    account_id: docusignConfig.accountId
  };
}

async function getValidAccessToken(): Promise<string | null> {
  if (!docusignTokenData) {
    return null;
  }

  // Check if token is expired
  if (Date.now() >= docusignTokenData.expires_at) {
    console.log('OAuth token expired, attempting refresh...');
    
    if (!docusignTokenData.refresh_token) {
      console.log('No refresh token available');
      return null;
    }
    
    try {
      // Refresh the token
      const refreshed = await refreshOAuthToken(docusignTokenData.refresh_token);
      if (refreshed) {
        return docusignTokenData.access_token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  return docusignTokenData.access_token;
}

async function refreshOAuthToken(refreshToken: string): Promise<boolean> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');

  if (!integrationKey || !clientSecret) {
    console.error('Missing integration key or client secret for token refresh');
    return false;
  }

  try {
    const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${integrationKey}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status, await response.text());
      return false;
    }

    const oAuthToken: OAuthTokenResponse = await response.json();
    
    // Update stored token data
    const expiresAt = Date.now() + (oAuthToken.expires_in * 1000);
    docusignTokenData = {
      ...docusignTokenData!,
      access_token: oAuthToken.access_token,
      refresh_token: oAuthToken.refresh_token || docusignTokenData!.refresh_token,
      expires_at: expiresAt
    };

    console.log('✅ OAuth token refreshed successfully');
    return true;

  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

async function getJWTAccessTokenWithSDK(integrationKey: string, userId: string, privateKey: string, accountId: string): Promise<string> {
  try {
    console.log('Using DocuSign SDK for JWT authentication...');
    console.log('Integration Key:', integrationKey.substring(0, 8) + '...');
    console.log('User ID:', userId.substring(0, 8) + '...');
    console.log('Account ID:', accountId.substring(0, 8) + '...');
    console.log('Target: demo.docusign.net environment');
    
    // Initialize DocuSign API client for demo environment
    const ApiClient = docusign.ApiClient || docusign.default?.ApiClient || docusign.default;
    const apiClient = new ApiClient();
    apiClient.setBasePath('https://demo.docusign.net/restapi');
    
    // Configure OAuth settings for demo
    apiClient.setOAuthBasePath('account-d.docusign.com');
    
    console.log('API Client configured for demo environment');
    
    // Clean and format the private key
    let cleanPrivateKey = privateKey.trim();
    
    // Ensure proper PKCS#8 format if needed
    if (cleanPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      console.log('Converting PKCS#1 key to PKCS#8 format for SDK');
      cleanPrivateKey = await convertPKCS1toPKCS8(cleanPrivateKey);
    } else if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      cleanPrivateKey = `-----BEGIN PRIVATE KEY-----\n${cleanPrivateKey}\n-----END PRIVATE KEY-----`;
    }
    
    console.log('Private key formatted successfully');
    
    // Request JWT token using the SDK
    console.log('Requesting JWT access token using SDK...');
    
    try {
      const results = await apiClient.requestJWTUserToken(
        integrationKey,
        userId,
        "signature",
        cleanPrivateKey,
        3600 // expiresIn: JWT token expiration in seconds (1 hour)
      );
      
      console.log('JWT token request successful');
      
      if (!results || !results.body || !results.body.access_token) {
        console.error('No access token in SDK response:', results);
        throw new Error('No access token received from DocuSign SDK');
      }
      
      const accessToken = results.body.access_token;
      console.log('✅ Successfully obtained DocuSign access token using SDK');
      console.log('Token type:', results.body.token_type);
      console.log('Expires in:', results.body.expires_in, 'seconds');
      
      return accessToken;
    } catch (jwtError) {
      console.error('JWT authentication failed:', jwtError);
      console.error('Error details:', jwtError.message);
      throw new Error(`DocuSign SDK JWT authentication failed: ${jwtError.message}`);
    }
    
  } catch (error: any) {
    console.error('DocuSign SDK JWT authentication failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Check for specific error types
    if (error.message && error.message.includes('consent_required')) {
      console.log('Consent required - user needs to grant consent first');
      const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth-callback`;
      const consentUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
      throw new Error(`CONSENT_REQUIRED: User consent is required. Visit: ${consentUrl}`);
    }
    
    if (error.message && error.message.includes('user_not_found')) {
      console.log('User not found error - User ID is incorrect');
      console.log('Current User ID being used:', userId);
      const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth-callback`;
      const consentUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
      throw new Error(`USER_NOT_FOUND: The User ID "${userId}" is not valid. Please use OAuth to get the correct User ID first. OAuth URL: ${consentUrl}`);
    }
    
    throw new Error(`DocuSign SDK JWT authentication failed: ${error.message}`);
  }
}

// Helper function to convert PKCS#1 to PKCS#8 format
async function convertPKCS1toPKCS8(pkcs1Key: string): Promise<string> {
  try {
    // Extract the raw key content
    const keyContent = pkcs1Key
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    // Decode the base64 content
    const binaryString = atob(keyContent);
    const pkcs1Data = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pkcs1Data[i] = binaryString.charCodeAt(i);
    }
    
    // RSA algorithm identifier in DER format
    const rsaAlgorithmId = new Uint8Array([
      0x30, 0x0d, // SEQUENCE, length 13
      0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, // RSA OID
      0x05, 0x00 // NULL parameters
    ]);
    
    // Create the PKCS#8 structure
    const pkcs8Structure: number[] = [];
    
    // Version (INTEGER 0)
    pkcs8Structure.push(0x02, 0x01, 0x00);
    
    // Algorithm identifier
    pkcs8Structure.push(...rsaAlgorithmId);
    
    // Private key (OCTET STRING)
    const privateKeyOctetString = encodeDERLength(pkcs1Data.length);
    pkcs8Structure.push(0x04, ...privateKeyOctetString, ...pkcs1Data);
    
    // Wrap in main SEQUENCE
    const mainSeqLength = encodeDERLength(pkcs8Structure.length);
    const pkcs8Data = new Uint8Array([0x30, ...mainSeqLength, ...pkcs8Structure]);
    
    // Convert back to base64
    const base64String = btoa(String.fromCharCode(...pkcs8Data));
    
    // Format as PEM
    return `-----BEGIN PRIVATE KEY-----\n${base64String.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
    
  } catch (error) {
    console.error('Failed to convert PKCS#1 to PKCS#8:', error);
    throw new Error('Failed to convert private key format');
  }
}

function encodeDERLength(length: number): number[] {
  if (length < 0x80) {
    return [length];
  }
  
  const bytes: number[] = [];
  let temp = length;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp = temp >> 8;
  }
  
  return [0x80 | bytes.length, ...bytes];
}

async function getUserInfo(accessToken: string): Promise<DocuSignUserInfo> {
  const response = await fetch('https://account-d.docusign.com/oauth/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to get user info: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

// Function to download document from DocuSign following the tutorial
async function downloadDocumentFromDocuSign(
  accessToken: string, 
  baseUri: string, 
  accountId: string, 
  envelopeId: string, 
  documentId: string = 'combined'
): Promise<Uint8Array> {
  
  console.log('📥 Downloading document from DocuSign...');
  console.log('🔗 Base URI:', baseUri);
  console.log('🏢 Account ID:', accountId);
  console.log('📋 Envelope ID:', envelopeId);
  console.log('📄 Document ID:', documentId);

  // Step 1: Check envelope status first (as per tutorial best practice)
  const envelopeStatusUrl = `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`;
  
  console.log('🔍 Checking envelope status at:', envelopeStatusUrl);
  
  const statusResponse = await fetch(envelopeStatusUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!statusResponse.ok) {
    const error = await statusResponse.text();
    console.error('❌ Failed to get envelope status:', error);
    throw new Error(`Failed to get envelope status: ${statusResponse.status} ${statusResponse.statusText}`);
  }

  const envelopeStatus = await statusResponse.json();
  console.log('📋 Envelope status:', envelopeStatus.status);
  
  if (envelopeStatus.status !== 'completed') {
    throw new Error(`Envelope is not completed. Current status: ${envelopeStatus.status}`);
  }

  // Step 2: Download the document (following tutorial API structure)
  const downloadUrl = `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}`;
  
  console.log('📥 Downloading from:', downloadUrl);
  
  const downloadResponse = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/pdf', // Specify PDF format
      'Content-Type': 'application/json'
    }
  });

  if (!downloadResponse.ok) {
    const error = await downloadResponse.text();
    console.error('❌ Failed to download document:', error);
    throw new Error(`Failed to download document: ${downloadResponse.status} ${downloadResponse.statusText}`);
  }

  console.log('✅ Document downloaded successfully');
  
  // Convert response to Uint8Array
  const arrayBuffer = await downloadResponse.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

serve(async (req: Request) => {
  console.log('=== DocuSign Download Signed Document Function Started ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { envelopeId, dealId, documentId = 'combined' } = await req.json();

    if (!envelopeId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: envelopeId and dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Processing request for envelope:', envelopeId, 'deal:', dealId);

    // Step 1: Get fresh DocuSign access token
    console.log('🔐 Step 1: Getting fresh DocuSign access token...');
    const { access_token, base_uri, account_id } = await getDocuSignAccessToken();
    console.log('✅ Successfully obtained fresh access token');

    // Step 2: Download document from DocuSign
    console.log('📥 Step 2: Downloading document from DocuSign...');
    const documentBytes = await downloadDocumentFromDocuSign(
      access_token,
      base_uri,
      account_id,
      envelopeId,
      documentId
    );

    console.log(`📊 Downloaded document size: ${documentBytes.length} bytes`);

    // Step 3: Get original document name from signature record
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
        fileName = `SIGNED_${originalDoc.name}`;
      }
    }

    // Step 4: Save to Supabase Storage
    console.log('💾 Step 3: Saving to Supabase storage...');
    const storagePath = `${dealId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, documentBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      throw new Error('Failed to save document to storage');
    }

    console.log('✅ Document saved to storage:', storagePath);

    // Step 5: Create document record in database
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
        uploaded_by: '00000000-0000-0000-0000-000000000000', // System user
        version: 1
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create document record:', createError);
      throw new Error('Failed to create document record');
    }

    // Step 6: Create document version record
    await supabase
      .from('document_versions')
      .insert({
        document_id: newDoc.id,
        version_number: 1,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        uploaded_by: newDoc.uploaded_by,
        description: 'Signed document downloaded from DocuSign'
      });

    // Step 7: Update signature status
    await supabase
      .from('document_signatures')
      .update({ 
        status: 'completed',
        signed_at: new Date().toISOString()
      })
      .eq('envelope_id', envelopeId);

    console.log('✅ Successfully downloaded and processed signed document');

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