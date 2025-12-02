import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// NOTE: Do NOT import docusign-esign SDK - it crashes in Deno due to Node.js dependencies
// Use direct REST API calls instead

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
  signerRole: 'buyer' | 'seller' | 'admin';
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

serve(async (req: Request) => {
  console.log('=== DocuSign Function Started ===');
  console.log('Request method:', req.method);
  
  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse URL to determine the operation
    const url = new URL(req.url);
    const operation = url.pathname.split('/').pop();

    console.log('Operation:', operation);

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
 * Handle authorization request - return authorization URL
 */
async function handleAuthorizationRequest(req: Request): Promise<Response> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  let redirectUri = Deno.env.get('DOCUSIGN_REDIRECT_URI');

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

  const state = crypto.randomUUID();
  
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

  const { code } = await req.json();

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
    const userInfo = await getUserInfo(oAuthToken.access_token);
    const defaultAccount = userInfo.accounts.find(acc => acc.is_default) || userInfo.accounts[0];
    
    if (!defaultAccount) {
      throw new Error('No DocuSign account found for user');
    }

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

  } catch (error: any) {
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

  } catch (error: any) {
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

  } catch (error: any) {
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
 * Handle status request
 */
async function handleStatusRequest(req: Request): Promise<Response> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
  
  return new Response(
    JSON.stringify({
      configured: !!(integrationKey && clientSecret),
      hasIntegrationKey: !!integrationKey,
      hasClientSecret: !!clientSecret,
      message: integrationKey && clientSecret 
        ? 'DocuSign is configured' 
        : 'DocuSign credentials not fully configured'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

/**
 * Get user info from DocuSign
 */
async function getUserInfo(accessToken: string): Promise<DocuSignUserInfo> {
  const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get token from database for the authenticated user
 */
async function getTokenFromDatabase(userId: string): Promise<{
  access_token: string;
  refresh_token?: string;
  account_id: string;
  base_uri: string;
  expires_at: string;
} | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('docusign_tokens')
    .select('access_token, refresh_token, account_id, base_uri, expires_at')
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    console.log('No token found in database for user:', userId);
    return null;
  }
  
  return data;
}

/**
 * Refresh token if expired
 */
async function refreshTokenIfNeeded(tokenData: {
  access_token: string;
  refresh_token?: string;
  account_id: string;
  base_uri: string;
  expires_at: string;
}, userId: string): Promise<string> {
  const expiresAt = new Date(tokenData.expires_at).getTime();
  const now = Date.now();
  
  // If token expires in less than 5 minutes, refresh it
  if (expiresAt - now < 5 * 60 * 1000 && tokenData.refresh_token) {
    console.log('Token expiring soon, refreshing...');
    
    const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
    
    if (!integrationKey || !clientSecret) {
      throw new Error('Missing DocuSign credentials for token refresh');
    }
    
    const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${integrationKey}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const newToken: OAuthTokenResponse = await response.json();
    
    // Update token in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const newExpiresAt = new Date(Date.now() + newToken.expires_in * 1000).toISOString();
    
    await supabase
      .from('docusign_tokens')
      .update({
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token || tokenData.refresh_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    return newToken.access_token;
  }
  
  return tokenData.access_token;
}

/**
 * Handle the main signing request using direct REST API calls
 */
async function handleSigningRequest(req: Request): Promise<Response> {
  console.log('=== Starting DocuSign Signing Request ===');

  // Get authenticated user from request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Parse request body
  const requestData: DocuSignRequest = await req.json();
  console.log('Request data:', JSON.stringify(requestData, null, 2));

  const { documentId, dealId, signerEmail, signerName, signerRole, signaturePositions } = requestData;

  if (!documentId || !dealId || !signerEmail || !signerName) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: documentId, dealId, signerEmail, signerName' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get user from JWT token
  const jwt = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  
  if (userError || !user) {
    console.error('User auth error:', userError);
    return new Response(
      JSON.stringify({ error: 'Invalid authentication token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Authenticated user:', user.id);

  // Get DocuSign token from database
  const tokenData = await getTokenFromDatabase(user.id);
  
  if (!tokenData) {
    return new Response(
      JSON.stringify({ 
        error: 'DocuSign not connected',
        requiresAuth: true,
        message: 'Please connect your DocuSign account first'
      }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Refresh token if needed
  const accessToken = await refreshTokenIfNeeded(tokenData, user.id);
  const accountId = tokenData.account_id;
  const baseUri = tokenData.base_uri;

  console.log('Using DocuSign account:', accountId);
  console.log('Base URI:', baseUri);

  // Get document from storage
  const { data: documentRecord, error: docError } = await supabase
    .from('documents')
    .select('storage_path, name')
    .eq('id', documentId)
    .single();

  if (docError || !documentRecord) {
    console.error('Document fetch error:', docError);
    return new Response(
      JSON.stringify({ error: 'Document not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Document record:', documentRecord);

  // Try to download document from storage
  let documentBase64: string;
  
  // Try multiple path patterns
  const pathsToTry = [
    documentRecord.storage_path,
    `${dealId}/${documentRecord.storage_path}`,
    documentRecord.storage_path.includes('/') ? documentRecord.storage_path : `${dealId}/${documentRecord.storage_path}`
  ];

  let downloadedData: Blob | null = null;
  let successPath: string | null = null;

  for (const path of pathsToTry) {
    console.log('Trying to download from path:', path);
    const { data, error } = await supabase.storage
      .from('deal_documents')
      .download(path);
    
    if (!error && data) {
      downloadedData = data;
      successPath = path;
      console.log('Successfully downloaded from:', path);
      break;
    }
    console.log('Failed to download from path:', path, error?.message);
  }

  if (!downloadedData) {
    return new Response(
      JSON.stringify({ error: 'Failed to download document from storage' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Convert to base64
  const arrayBuffer = await downloadedData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  documentBase64 = btoa(binary);

  console.log('Document converted to base64, length:', documentBase64.length);

  // Build signers from signature positions
  const signers: any[] = [];
  
  if (signaturePositions && signaturePositions.length > 0) {
    signaturePositions.forEach((pos, index) => {
      signers.push({
        email: pos.email,
        name: pos.name,
        recipientId: pos.recipientId || String(index + 1),
        routingOrder: String(index + 1),
        tabs: {
          signHereTabs: [{
            documentId: '1',
            pageNumber: pos.pageNumber || '1',
            xPosition: pos.xPosition || '100',
            yPosition: pos.yPosition || '100'
          }]
        }
      });
    });
  } else {
    // Default signer if no positions specified
    signers.push({
      email: signerEmail,
      name: signerName,
      recipientId: '1',
      routingOrder: '1',
      tabs: {
        signHereTabs: [{
          documentId: '1',
          pageNumber: '1',
          xPosition: '100',
          yPosition: '700'
        }]
      }
    });
  }

  console.log('Signers:', JSON.stringify(signers, null, 2));

  // Create envelope using DocuSign REST API directly
  const envelopeDefinition = {
    emailSubject: `Please sign: ${documentRecord.name}`,
    documents: [{
      documentBase64: documentBase64,
      documentId: '1',
      fileExtension: documentRecord.name.split('.').pop() || 'pdf',
      name: documentRecord.name
    }],
    recipients: {
      signers: signers
    },
    status: 'sent'
  };

  console.log('Creating envelope with DocuSign REST API...');

  const envelopeResponse = await fetch(
    `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envelopeDefinition)
    }
  );

  if (!envelopeResponse.ok) {
    const errorText = await envelopeResponse.text();
    console.error('DocuSign API error:', envelopeResponse.status, errorText);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create DocuSign envelope',
        details: errorText
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const envelopeResult = await envelopeResponse.json();
  console.log('Envelope created:', envelopeResult);

  // Store signature records in database
  for (const signer of signers) {
    await supabase.from('document_signatures').insert({
      document_id: documentId,
      deal_id: dealId,
      envelope_id: envelopeResult.envelopeId,
      signer_email: signer.email,
      signer_role: signerRole,
      status: 'sent'
    });
  }

  // Update document status
  await supabase
    .from('documents')
    .update({ status: 'final' })
    .eq('id', documentId);

  return new Response(
    JSON.stringify({
      success: true,
      envelopeId: envelopeResult.envelopeId,
      status: envelopeResult.status,
      message: 'Document sent for signature successfully'
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
