import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Tabs, Recipients } from 'npm:docusign-esign@8.2.0';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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
    // Parse URL to determine the operation
    const url = new URL(req.url);
    const operation = url.pathname.split('/').pop();

    console.log('Operation:', operation);

    // Handle configuration endpoint
    if (operation === 'configure') {
      return await handleConfigureRequest(req);
    }

    // Handle OAuth operations
    if (operation === 'auth') {
      return await handleAuthorizationRequest(req);
    }
    
    if (operation === 'token') {
      return await handleTokenRequest(req);
    }
    
    if (operation === 'refresh') {
      return await handleRefreshRequest(req);
    }
    
    if (operation === 'userinfo') {
      return await handleUserInfoRequest(req);
    }

    // Handle status endpoint
    if (operation === 'status') {
      return await handleStatusRequest(req);
    }

    // Default signing operation
    return await handleSigningRequest(req);

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

/**
 * Handle configuration request - set DocuSign credentials
 */
async function handleConfigureRequest(req: Request): Promise<Response> {
  const { integrationKey, userId, privateKey, accountId } = await req.json();

  if (!integrationKey || !userId || !privateKey || !accountId) {
    return new Response(
      JSON.stringify({ error: 'Missing required credentials: integrationKey, userId, privateKey, accountId' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  // Store configuration
  docusignConfig = {
    integrationKey,
    userId,
    privateKey,
    accountId
  };

  console.log('✅ DocuSign configuration updated');

  return new Response(
    JSON.stringify({
      success: true,
      message: 'DocuSign configuration updated successfully',
      config: {
        integrationKey: integrationKey.substring(0, 8) + '...',
        userId: userId.substring(0, 8) + '...',
        accountId: accountId.substring(0, 8) + '...',
        hasPrivateKey: !!privateKey
      }
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

/**
 * Handle authorization request - return authorization URL
 */
async function handleAuthorizationRequest(req: Request): Promise<Response> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  let redirectUri = Deno.env.get('DOCUSIGN_REDIRECT_URI');

  // If no redirect URI is configured, use the callback function URL
  if (!redirectUri) {
    redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-callback`;
  }

  if (!integrationKey) {
    return new Response(
      JSON.stringify({ error: 'Missing DOCUSIGN_INTEGRATION_KEY' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  // Generate a random state parameter for security
  const state = crypto.randomUUID();
  
  // Build authorization URL
  const authUrl = new URL(`${DOCUSIGN_AUTH_BASE_URL}/oauth/auth`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'signature');
  authUrl.searchParams.set('client_id', integrationKey);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  return new Response(
    JSON.stringify({
      authorizationUrl: authUrl.toString(),
      state: state,
      message: 'Visit the authorization URL to grant access'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

/**
 * Handle token request - exchange authorization code for access token
 */
async function handleTokenRequest(req: Request): Promise<Response> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
  const redirectUri = Deno.env.get('DOCUSIGN_REDIRECT_URI');

  if (!integrationKey || !clientSecret || !redirectUri) {
    return new Response(
      JSON.stringify({ error: 'Missing required environment variables' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  const { code, state } = await req.json();

  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Authorization code is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    // Exchange authorization code for access token
    const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${integrationKey}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errorData}`);
    }

    const oAuthToken: OAuthTokenResponse = await response.json();

    // Get user info
    const userInfo = await getUserInfo(oAuthToken.access_token);

    // Set base path for the default account
    const defaultAccount = userInfo.accounts.find(acc => acc.is_default) || userInfo.accounts[0];
    
    if (!defaultAccount) {
      throw new Error('No DocuSign account found for user');
    }

    // Store token information
    const expiresAt = Date.now() + (oAuthToken.expires_in * 1000);
    docusignTokenData = {
      access_token: oAuthToken.access_token,
      refresh_token: oAuthToken.refresh_token,
      account_id: defaultAccount.account_id,
      base_uri: defaultAccount.base_uri,
      expires_at: expiresAt,
      user_info: userInfo
    };

    console.log('✅ Successfully obtained DocuSign access token via OAuth');

    return new Response(
      JSON.stringify({
        success: true,
        token: {
          access_token: oAuthToken.access_token,
          token_type: oAuthToken.token_type,
          expires_in: oAuthToken.expires_in,
          refresh_token: oAuthToken.refresh_token,
          scope: oAuthToken.scope
        },
        userInfo: userInfo,
        apiConfig: {
          accountId: defaultAccount.account_id,
          basePath: defaultAccount.base_uri + '/restapi',
          baseUri: defaultAccount.base_uri
        },
        message: 'Token acquired successfully via OAuth'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Token exchange failed',
        message: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

/**
 * Handle refresh token request
 */
async function handleRefreshRequest(req: Request): Promise<Response> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');

  if (!integrationKey || !clientSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing required environment variables' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  const { refresh_token } = await req.json();

  if (!refresh_token) {
    return new Response(
      JSON.stringify({ error: 'Refresh token is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
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
        refresh_token: refresh_token
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${errorData}`);
    }

    const oAuthToken: OAuthTokenResponse = await response.json();

    // Update the stored token data with the new access token
    if (docusignTokenData) {
      const expiresAt = Date.now() + (oAuthToken.expires_in * 1000);
      docusignTokenData = {
        ...docusignTokenData,
        access_token: oAuthToken.access_token,
        refresh_token: oAuthToken.refresh_token || docusignTokenData.refresh_token,
        expires_at: expiresAt
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        token: {
          access_token: oAuthToken.access_token,
          token_type: oAuthToken.token_type,
          expires_in: oAuthToken.expires_in,
          refresh_token: oAuthToken.refresh_token,
          scope: oAuthToken.scope
        },
        message: 'Token refreshed successfully'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Token refresh failed',
        message: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

/**
 * Handle user info request
 */
async function handleUserInfoRequest(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization header with access token is required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const userInfo = await getUserInfo(accessToken);
    
    const defaultAccount = userInfo.accounts.find(acc => acc.is_default) || userInfo.accounts[0];

    return new Response(
      JSON.stringify({
        success: true,
        userInfo: userInfo,
        apiConfig: defaultAccount ? {
          accountId: defaultAccount.account_id,
          basePath: defaultAccount.base_uri + '/restapi',
          baseUri: defaultAccount.base_uri
        } : null
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('User info error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get user info',
        message: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

/**
 * Handle status request - get current configuration and token status
 */
async function handleStatusRequest(req: Request): Promise<Response> {
  // Check OAuth token data first
  if (docusignTokenData) {
    const expired = isTokenExpired();
    
    return new Response(
      JSON.stringify({
        success: true,
        authMethod: 'oauth',
        isAuthenticated: true,
        tokenData: {
          account_id: docusignTokenData.account_id,
          base_uri: docusignTokenData.base_uri,
          expires_at: docusignTokenData.expires_at,
          user_info: docusignTokenData.user_info
        },
        tokenStatus: {
          isExpired: expired,
          hasRefreshToken: !!docusignTokenData.refresh_token,
          expiresIn: Math.max(0, docusignTokenData.expires_at - Date.now()) / 1000
        },
        message: expired ? 'OAuth token is expired' : 'OAuth token is valid'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  // Check legacy JWT configuration
  if (!docusignConfig) {
    return new Response(
      JSON.stringify({ 
        success: false,
        authMethod: 'none',
        message: 'DocuSign not configured. Please configure credentials or use OAuth authentication.',
        isConfigured: false,
        isAuthenticated: false
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  const hasValidToken = docusignConfig.accessToken && 
    docusignConfig.tokenExpiresAt && 
    Date.now() < docusignConfig.tokenExpiresAt;

  return new Response(
    JSON.stringify({
      success: true,
      authMethod: 'jwt',
      isConfigured: true,
      isAuthenticated: hasValidToken,
      hasValidToken,
      tokenExpiresIn: hasValidToken ? 
        Math.max(0, (docusignConfig.tokenExpiresAt! - Date.now()) / 1000) : 0,
      config: {
        integrationKey: docusignConfig.integrationKey.substring(0, 8) + '...',
        userId: docusignConfig.userId.substring(0, 8) + '...',
        accountId: docusignConfig.accountId.substring(0, 8) + '...'
      }
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

/**
 * Handle signing request - main document signing logic
 */
async function handleSigningRequest(req: Request): Promise<Response> {
  // Auto-configure from environment variables if not already configured
  if (!docusignTokenData && !docusignConfig) {
    const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const userId = Deno.env.get('DOCUSIGN_USER_ID');
    const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');

    if (integrationKey && userId && privateKey && accountId) {
      console.log('Auto-configuring DocuSign from environment variables');
      console.log('Integration Key:', integrationKey?.substring(0, 8) + '...');
      console.log('User ID:', userId?.substring(0, 8) + '...');
      console.log('Account ID:', accountId?.substring(0, 8) + '...');
      console.log('Has Private Key:', !!privateKey);
      docusignConfig = {
        integrationKey,
        userId,
        privateKey,
        accountId
      };
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'DocuSign not configured. Please use OAuth authentication or configure JWT credentials.',
          oauthEndpoint: '/auth',
          configureEndpoint: '/configure',
          missingEnvVars: {
            DOCUSIGN_INTEGRATION_KEY: !integrationKey,
            DOCUSIGN_USER_ID: !userId,
            DOCUSIGN_PRIVATE_KEY: !privateKey,
            DOCUSIGN_ACCOUNT_ID: !accountId
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
  }

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
  let fileData: Blob | null = null;
  let downloadError: any = null;
  
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
}

async function getDocuSignAccessToken(): Promise<string> {
  // First try OAuth token if available
  const oauthToken = await getValidAccessToken();
  if (oauthToken) {
    console.log('Using OAuth access token');
    return oauthToken;
  }

  // Fall back to JWT authentication if configured
  if (!docusignConfig) {
    throw new Error('DocuSign not configured. Please use OAuth authentication or configure JWT credentials.');
  }

  // Check if we have a valid cached JWT token
  if (docusignConfig.accessToken && 
      docusignConfig.tokenExpiresAt && 
      Date.now() < docusignConfig.tokenExpiresAt - 300000) { // 5 minutes buffer
    console.log('Using cached JWT access token');
    return docusignConfig.accessToken;
  }

  // Get new token using JWT
  console.log('Getting new JWT access token...');
  const accessToken = await getJWTAccessToken(
    docusignConfig.integrationKey,
    docusignConfig.userId,
    docusignConfig.privateKey
  );

  // Cache the token (expires in 1 hour)
  docusignConfig.accessToken = accessToken;
  docusignConfig.tokenExpiresAt = Date.now() + (3600 * 1000); // 1 hour

  return accessToken;
}

async function getJWTAccessToken(integrationKey: string, userId: string, privateKey: string): Promise<string> {
  try {
    console.log('Requesting DocuSign JWT access token (manual implementation)...');
    console.log('Integration Key:', integrationKey.substring(0, 8) + '...');
    console.log('User ID:', userId.substring(0, 8) + '...');
    console.log('Target: demo.docusign.net environment');
    
    // Clean and format the private key
    let cleanPrivateKey = privateKey.trim();
    
    // Ensure proper PKCS#8 format
    if (cleanPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      // Convert PKCS#1 to PKCS#8 format
      console.log('Converting PKCS#1 key to PKCS#8 format');
      cleanPrivateKey = await convertPKCS1toPKCS8(cleanPrivateKey);
    } else if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Assume it's a raw PKCS#8 key without headers
      cleanPrivateKey = `-----BEGIN PRIVATE KEY-----\n${cleanPrivateKey}\n-----END PRIVATE KEY-----`;
    }
    
    // Create JWT header
    const header = {
      "alg": "RS256",
      "typ": "JWT"
    };
    
    // Create JWT payload - targeting demo environment
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      "iss": integrationKey,
      "sub": userId,
      "aud": "account-d.docusign.com", // OAuth endpoint
      "iat": now,
      "exp": now + 3600, // 1 hour expiration
      "scope": "signature"
    };
    
    console.log('JWT payload created for demo environment');
    
    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/[+\/=]/g, (m) => ({"+":"-", "/":"_", "=":""}[m] || m));
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+\/=]/g, (m) => ({"+":"-", "/":"_", "=":""}[m] || m));
    
    // Create signature data
    const signatureData = `${encodedHeader}.${encodedPayload}`;
    
    // Convert PEM to DER format for Web Crypto API
    const pemContent = cleanPrivateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    // Decode base64 to get DER format
    const binaryString = atob(pemContent);
    const keyData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      keyData[i] = binaryString.charCodeAt(i);
    }
    
    // Import private key
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
    
    // Sign the data
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(signatureData)
    );
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[+\/=]/g, (m) => ({"+":"-", "/":"_", "=":""}[m] || m));
    
    const jwt = `${signatureData}.${encodedSignature}`;
    
    console.log('JWT created successfully, exchanging for access token...');
    
    // Exchange JWT for access token using the demo environment OAuth endpoint
    const response = await fetch('https://account-d.docusign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DocuSign JWT authentication failed. Status:', response.status);
      console.error('DocuSign JWT error details:', errorData);
      
      // Check if this is a consent required error
      if (response.status === 400 && errorData.includes('consent_required')) {
        console.log('Consent required - user needs to grant consent first');
        const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth-callback`;
        const consentUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
        throw new Error(`CONSENT_REQUIRED: User consent is required. Visit: ${consentUrl}`);
      }
      
      // Check if this is a user_not_found error
      if (response.status === 400 && errorData.includes('user_not_found')) {
        console.log('User not found error - User ID is incorrect');
        console.log('Current User ID being used:', userId);
        const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth-callback`;
        const consentUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
        throw new Error(`USER_NOT_FOUND: The User ID "${userId}" is not valid. Please use OAuth to get the correct User ID first. OAuth URL: ${consentUrl}`);
      }
      
      throw new Error(`DocuSign JWT authentication failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      console.error('No access token in JWT response:', data);
      throw new Error('No access token received from DocuSign JWT');
    }

    console.log('✅ Successfully obtained DocuSign access token for demo environment');
    console.log('Token type:', data.token_type);
    console.log('Expires in:', data.expires_in, 'seconds');
    
    // Get user info to validate the token and log account details
    try {
      console.log('Validating token by getting user info...');
      const userInfoResponse = await fetch('https://account-d.docusign.com/oauth/userinfo', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        console.log('✅ Token validated successfully');
        console.log('User:', userInfo.name);
        console.log('Email:', userInfo.email);
        
        if (userInfo.accounts && userInfo.accounts.length > 0) {
          const defaultAccount = userInfo.accounts.find(acc => acc.is_default) || userInfo.accounts[0];
          console.log('Account:', defaultAccount?.account_name);
          console.log('Base URI:', defaultAccount?.base_uri);
          console.log('Account ID:', defaultAccount?.account_id);
        }
      }
    } catch (userInfoError) {
      console.log('Could not get user info (token still valid):', userInfoError.message);
    }
    
    return data.access_token;
    
  } catch (error: any) {
    console.error('JWT authentication failed with error:', error);
    throw new Error(`DocuSign JWT authentication failed: ${error.message}`);
  }
}

// Helper function to convert PKCS#1 to PKCS#8
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
    
    // Format as PEM with line breaks every 64 characters
    const pemLines = [];
    for (let i = 0; i < base64String.length; i += 64) {
      pemLines.push(base64String.slice(i, i + 64));
    }
    
    const pemString = `-----BEGIN PRIVATE KEY-----\n${pemLines.join('\n')}\n-----END PRIVATE KEY-----`;
    
    console.log('Successfully converted PKCS#1 to PKCS#8');
    return pemString;
    
  } catch (error) {
    console.error('Error converting PKCS#1 to PKCS#8:', error);
    throw new Error('Failed to convert private key format');
  }
}

// Helper function to encode DER length
function encodeDERLength(length: number): number[] {
  if (length < 0x80) {
    return [length];
  } else if (length <= 0xff) {
    return [0x81, length];
  } else if (length <= 0xffff) {
    return [0x82, (length >> 8) & 0xff, length & 0xff];
  } else if (length <= 0xffffff) {
    return [0x83, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff];
  } else {
    return [0x84, (length >> 24) & 0xff, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff];
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

/**
 * Get DocuSign user information
 */
async function getUserInfo(accessToken: string): Promise<DocuSignUserInfo> {
  const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Access token has expired or is invalid');
    }
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  return await response.json();
}

/**
 * Check if the current token is expired
 */
function isTokenExpired(): boolean {
  if (!docusignTokenData) {
    return true;
  }
  
  // Check if token expires in the next 5 minutes (300000 ms)
  return Date.now() >= (docusignTokenData.expires_at - 300000);
}

/**
 * Get valid access token (refresh if needed)
 */
async function getValidAccessToken(): Promise<string | null> {
  if (!docusignTokenData) {
    return null;
  }

  if (isTokenExpired() && docusignTokenData.refresh_token) {
    try {
      // Auto-refresh the token
      const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
      const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
      
      if (!integrationKey || !clientSecret) {
        throw new Error('Missing integration key or client secret');
      }

      const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${integrationKey}:${clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: docusignTokenData.refresh_token
        })
      });

      if (response.ok) {
        const oAuthToken: OAuthTokenResponse = await response.json();
        const expiresAt = Date.now() + (oAuthToken.expires_in * 1000);
        
        docusignTokenData = {
          ...docusignTokenData,
          access_token: oAuthToken.access_token,
          refresh_token: oAuthToken.refresh_token || docusignTokenData.refresh_token,
          expires_at: expiresAt
        };
        
        console.log('✅ Token automatically refreshed');
        return docusignTokenData.access_token;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  return docusignTokenData?.access_token || null;
}