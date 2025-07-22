import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Import DocuSign SDK using default export pattern for Deno
const docusign = await import('npm:docusign-esign@8.2.0');

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
  buyerEmail?: string;
  buyerName?: string;
  signaturePositions?: Array<{
    email: string;
    name: string;
    recipientId: string;
    xPosition: string;
    yPosition: string;
    pageNumber: string;
  }>;
}

interface EnvelopeRecipient {
  email: string;
  name: string;
  recipientId: string;
  routingOrder: string;
  xPosition?: string;
  yPosition?: string;
  pageNumber?: string;
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

    // Store token information in database and memory
    const expiresAt = Date.now() + (oAuthToken.expires_in * 1000);
    docusignTokenData = {
      access_token: oAuthToken.access_token,
      refresh_token: oAuthToken.refresh_token,
      account_id: defaultAccount.account_id,
      base_uri: defaultAccount.base_uri,
      expires_at: expiresAt,
      user_info: userInfo
    };
    
    // Tokens are stored in memory only, no database persistence needed

    console.log('✅ Successfully obtained and stored DocuSign access token via OAuth');

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
  console.log('🔍 Status request - checking for stored token data...');
  
  // Use JWT authentication directly, no database lookup needed
  
  // Check OAuth token data in memory (fallback)
  if (docusignTokenData) {
    const expired = isTokenExpired();
    
    return new Response(
      JSON.stringify({
        success: true,
        authMethod: 'oauth',
        isAuthenticated: true,
        // For compatibility with retrieve function, include fields at top level
        account_id: docusignTokenData.account_id,
        base_uri: docusignTokenData.base_uri,
        access_token: docusignTokenData.access_token,
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
  const { documentId, dealId, signerEmail, signerName, signerRole, buyerEmail, buyerName, signaturePositions }: DocuSignRequest = await req.json();

  console.log('DocuSign request:', { documentId, dealId, signerEmail, signerName, signerRole, buyerEmail, buyerName, hasPositions: !!signaturePositions });

  // Get document details from database
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error('Document not found');
  }

  // Prepare signers list
  let signers: EnvelopeRecipient[] = [];

  if (signaturePositions && signaturePositions.length > 0) {
    // Use the provided signature positions
    signers = signaturePositions.map((pos, index) => ({
      email: pos.email,
      name: pos.name,
      recipientId: pos.recipientId,
      routingOrder: (index + 1).toString(),
      xPosition: pos.xPosition,
      yPosition: pos.yPosition,
      pageNumber: pos.pageNumber
    }));
    console.log('Using provided signature positions:', signers);
  } else {
    // Fallback to legacy behavior - find opposite party
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

    signers = [
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
    ];

    console.log('Using legacy signer setup:', signers);
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

  // Determine file extension from filename
  const fileExtension = document.name.split('.').pop()?.toLowerCase() || 'pdf';
  console.log(`Document file extension: ${fileExtension}`);
  
  let documentBase64 = '';
  let finalFileExtension = fileExtension;
  
  // For all file types, convert to base64 directly
  // DocuSign supports DOCX natively, so no conversion needed
  const arrayBuffer = await fileData.arrayBuffer();
  documentBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  // Get DocuSign access token
  const accessToken = await getDocuSignAccessToken();

  // Get DocuSign configuration for saving to database
  let tokenDataToSave = null;
  
  // Try to get OAuth token data first
  if (docusignTokenData) {
    tokenDataToSave = docusignTokenData;
  } else if (docusignConfig) {
    // Create token data from JWT configuration
    tokenDataToSave = {
      access_token: accessToken,
      refresh_token: null,
      account_id: docusignConfig.accountId,
      base_uri: 'https://demo.docusign.net',
      expires_at: Date.now() + (3600 * 1000), // 1 hour from now
      user_info: { sub: docusignConfig.userId, name: 'JWT User', email: '', accounts: [] }
    };
  }

  console.log('✅ Successfully obtained DocuSign access token using SDK');

  // Create envelope for signing
  const envelope = await createDocuSignEnvelope({
    document: {
      documentBase64,
      documentId: '1',
      fileExtension: finalFileExtension,
      name: document.name
    },
    signers,
    accessToken
  });

  // Get signing URL for the first signer
  const signingUrl = await getSigningUrl(envelope.envelopeId, '1', accessToken, signerEmail, signerName);

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

  // Fall back to JWT authentication using DocuSign SDK
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

  // Get new token using DocuSign SDK
  console.log('Getting new JWT access token using DocuSign SDK...');
  const accessToken = await getJWTAccessTokenWithSDK(
    docusignConfig.integrationKey,
    docusignConfig.userId,
    docusignConfig.privateKey,
    docusignConfig.accountId
  );

  // Cache the token (expires in 1 hour)
  docusignConfig.accessToken = accessToken;
  docusignConfig.tokenExpiresAt = Date.now() + (3600 * 1000); // 1 hour

  return accessToken;
}

async function getJWTAccessTokenWithSDK(integrationKey: string, userId: string, privateKey: string, accountId: string): Promise<string> {
  try {
    console.log('Using DocuSign SDK for JWT authentication...');
    console.log('Integration Key:', integrationKey.substring(0, 8) + '...');
    console.log('User ID:', userId.substring(0, 8) + '...');
    console.log('Account ID:', accountId.substring(0, 8) + '...');
    console.log('Target: demo.docusign.net environment');
    
    // Initialize DocuSign API client for demo environment
    console.log('DocuSign module structure:', Object.keys(docusign));
    const ApiClient = docusign.ApiClient || docusign.default?.ApiClient || docusign.default;
    console.log('ApiClient type:', typeof ApiClient);
    console.log('ApiClient keys:', ApiClient ? Object.keys(ApiClient) : 'undefined');
    const apiClient = new ApiClient();
    apiClient.setBasePath('https://demo.docusign.net/restapi');
    
    // Configure OAuth settings for demo - the SDK seems to prepend https:// automatically
    // Use just the domain name to avoid double https://
    apiClient.setOAuthBasePath('account-d.docusign.com');
    
    console.log('API Client configured for demo environment');
    console.log('Base Path:', apiClient.getBasePath());
    console.log('OAuth Base Path:', 'account-d.docusign.com');
    
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
    
    // Define scopes for JWT
    const scopes = ['signature'];
    
    // Request JWT token using the SDK
    console.log('Requesting JWT access token using SDK...');
    
    // Using the correct DocuSign SDK method and parameter structure
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

async function createDocuSignEnvelope(params: {
  document: EnvelopeDocument;
  signers: EnvelopeRecipient[];
  accessToken: string;
}): Promise<{ envelopeId: string }> {
  try {
    console.log('Creating DocuSign envelope using SDK...');
    
    // Initialize API client with DocuSign SDK classes
    const ApiClient = docusign.ApiClient || docusign.default?.ApiClient || docusign.default;
    const EnvelopesApi = docusign.EnvelopesApi || docusign.default?.EnvelopesApi;
    const Document = docusign.Document || docusign.default?.Document;
    const Signer = docusign.Signer || docusign.default?.Signer;
    const SignHere = docusign.SignHere || docusign.default?.SignHere;
    const Tabs = docusign.Tabs || docusign.default?.Tabs;
    const Recipients = docusign.Recipients || docusign.default?.Recipients;
    const EnvelopeDefinition = docusign.EnvelopeDefinition || docusign.default?.EnvelopeDefinition;
    const apiClient = new ApiClient();
    
    // Get account info to set proper base path
    const accountId = docusignConfig?.accountId || docusignTokenData?.account_id;
    if (!accountId) {
      throw new Error('No account ID available');
    }
    
    // Set base path based on available token data
    if (docusignTokenData?.base_uri) {
      apiClient.setBasePath(docusignTokenData.base_uri + '/restapi');
    } else {
      apiClient.setBasePath('https://demo.docusign.net/restapi');
    }
    
    console.log('API Client base path:', apiClient.getBasePath());
    
    // Create EnvelopesApi instance
    const envelopesApi = new EnvelopesApi(apiClient);
    
    // Create document
    const document = new Document();
    document.documentBase64 = params.document.documentBase64;
    document.documentId = params.document.documentId;
    // Ensure proper file extension format
    const extension = params.document.fileExtension;
    document.fileExtension = extension === 'docx' ? 'docx' : 'pdf';
    document.name = params.document.name;
    
    console.log('Document details:', {
      name: document.name,
      fileExtension: document.fileExtension,
      documentId: document.documentId,
      base64Length: document.documentBase64?.length || 0
    });
    
    // Create signers
    const signers = params.signers.map((signerInfo, index) => {
      const signer = new Signer();
      signer.email = signerInfo.email;
      signer.name = signerInfo.name;
      signer.recipientId = signerInfo.recipientId;
      signer.routingOrder = signerInfo.routingOrder;
      
      // Only set clientUserId for embedded signing (first signer gets signing URL)
      // For remote signing, don't set clientUserId so DocuSign sends email
      if (index === 0) {
        signer.clientUserId = signerInfo.recipientId;
      }
      
      // Add signature tabs with coordinates
      const signHere = new SignHere();
      signHere.documentId = params.document.documentId;
      signHere.pageNumber = signerInfo.pageNumber || '1';
      signHere.recipientId = signerInfo.recipientId;
      signHere.tabLabel = `SignHere${index + 1}`;
      signHere.xPosition = signerInfo.xPosition || '100';
      signHere.yPosition = signerInfo.yPosition || `${200 + (index * 100)}`;
      
      const tabs = new Tabs();
      tabs.signHereTabs = [signHere];
      signer.tabs = tabs;
      
      return signer;
    });
    
    console.log('Signers configuration:', signers.map(s => ({
      email: s.email,
      name: s.name,
      recipientId: s.recipientId,
      clientUserId: s.clientUserId,
      hasSignHereTabs: s.tabs?.signHereTabs?.length || 0
    })));
    
    // Create recipients
    const recipients = new Recipients();
    recipients.signers = signers;
    
    // Create envelope definition
    const envelopeDefinition = new EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Please sign this document';
    envelopeDefinition.documents = [document];
    envelopeDefinition.recipients = recipients;
    envelopeDefinition.status = 'sent';
    
    console.log('Sending envelope to DocuSign...');
    
    // Set authentication
    apiClient.addDefaultHeader('Authorization', `Bearer ${params.accessToken}`);
    
    // Create envelope
    const result = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition: envelopeDefinition
    });
    
    if (!result || !result.envelopeId) {
      throw new Error('Failed to create envelope - no envelope ID returned');
    }
    
    console.log('✅ Envelope created successfully:', result.envelopeId);
    
    return { envelopeId: result.envelopeId };
    
  } catch (error: any) {
    console.error('Failed to create DocuSign envelope using SDK:', error);
    throw new Error(`Failed to create envelope: ${error.message}`);
  }
}

async function getSigningUrl(envelopeId: string, recipientId: string, accessToken: string, recipientEmail: string, recipientName: string): Promise<string> {
  try {
    console.log('Getting signing URL using SDK...');
    console.log('Parameters:', { envelopeId, recipientId, recipientEmail, recipientName });
    
    // Initialize API client with DocuSign SDK classes
    const ApiClient = docusign.ApiClient || docusign.default?.ApiClient || docusign.default;
    const EnvelopesApi = docusign.EnvelopesApi || docusign.default?.EnvelopesApi;
    const RecipientViewRequest = docusign.RecipientViewRequest || docusign.default?.RecipientViewRequest;
    const apiClient = new ApiClient();
    
    const accountId = docusignConfig?.accountId || docusignTokenData?.account_id;
    if (!accountId) {
      throw new Error('No account ID available');
    }
    
    // Set base path based on available token data
    if (docusignTokenData?.base_uri) {
      apiClient.setBasePath(docusignTokenData.base_uri + '/restapi');
    } else {
      apiClient.setBasePath('https://demo.docusign.net/restapi');
    }
    
    // Create EnvelopesApi instance
    const envelopesApi = new EnvelopesApi(apiClient);
    
    // Create recipient view request with required fields
    const recipientViewRequest = new RecipientViewRequest();
    recipientViewRequest.authenticationMethod = 'email';
    recipientViewRequest.email = recipientEmail;
    recipientViewRequest.userName = recipientName;
    recipientViewRequest.clientUserId = recipientId; // Must match the clientUserId set during envelope creation
    recipientViewRequest.returnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-callback?envelopeId=${envelopeId}`;
    
    console.log('Recipient view request:', {
      authenticationMethod: recipientViewRequest.authenticationMethod,
      email: recipientViewRequest.email,
      userName: recipientViewRequest.userName,
      clientUserId: recipientViewRequest.clientUserId,
      returnUrl: recipientViewRequest.returnUrl
    });
    
    console.log('Requesting signing URL from DocuSign...');
    console.log('Account ID:', accountId);
    console.log('Envelope ID:', envelopeId);
    console.log('API Base Path:', apiClient.getBasePath());
    
    // Set authentication
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    
    // First check the envelope status - it must be "sent" to create a recipient view
    console.log('Checking envelope status before creating recipient view...');
    try {
      const envelopeInfo = await envelopesApi.getEnvelope(accountId, envelopeId);
      console.log('Envelope status:', envelopeInfo.status);
      console.log('Envelope details:', {
        status: envelopeInfo.status,
        statusChangedDateTime: envelopeInfo.statusChangedDateTime,
        emailSubject: envelopeInfo.emailSubject
      });
      
      if (envelopeInfo.status !== 'sent') {
        console.error('Envelope is not in sent status. Current status:', envelopeInfo.status);
        throw new Error(`Envelope must be sent before creating recipient view. Current status: ${envelopeInfo.status}`);
      }
    } catch (statusError: any) {
      console.error('Failed to check envelope status:', statusError);
      // Continue anyway - maybe the status check failed but we can still try to create the recipient view
    }
    
    try {
      // Get recipient view
      const result = await envelopesApi.createRecipientView(accountId, envelopeId, {
        recipientViewRequest: recipientViewRequest
      });
      
      console.log('DocuSign API Response:', result);
      
      if (!result || !result.url) {
        console.error('No URL in DocuSign response:', result);
        throw new Error('Failed to get signing URL - no URL returned');
      }
      
      console.log('✅ Signing URL obtained successfully:', result.url);
      
      return result.url;
    } catch (apiError: any) {
      console.error('DocuSign API Error Details:', {
        message: apiError.message,
        status: apiError.status,
        statusText: apiError.statusText,
        response: apiError.response?.body || apiError.response?.text || apiError.response,
        headers: apiError.response?.headers
      });
      
      // Try to get the response body text for more details
      if (apiError.response?.res) {
        try {
          const responseText = await apiError.response.res.text();
          console.error('DocuSign Response Body:', responseText);
        } catch (e) {
          console.error('Could not read response body:', e);
        }
      }
      
      throw apiError;
    }
    
  } catch (error: any) {
    console.error('Failed to get signing URL using SDK:', error);
    throw new Error(`Failed to get signing URL: ${error.message}`);
  }
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

function isTokenExpired(): boolean {
  if (!docusignTokenData) {
    return true;
  }
  
  return Date.now() >= docusignTokenData.expires_at;
}