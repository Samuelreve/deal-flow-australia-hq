/**
 * DocuSign OAuth Token Acquisition Function
 * 
 * This function handles the OAuth Authorization Code Grant flow for DocuSign.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

// Store DocuSign token data as variables
let docusignTokenData: {
  access_token: string;
  refresh_token?: string;
  account_id: string;
  base_uri: string;
  expires_at: number;
  user_info: DocuSignUserInfo;
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

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse URL to determine the operation
    const url = new URL(req.url);
    const operation = url.pathname.split('/').pop();

    switch (operation) {
      case 'auth':
        return await handleAuthorizationRequest(req);
      case 'token':
        return await handleTokenRequest(req);
      case 'refresh':
        return await handleRefreshRequest(req);
      case 'userinfo':
        return await handleUserInfoRequest(req);
      case 'status':
        return await handleStatusRequest(req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation. Use /auth, /token, /refresh, /userinfo, or /status' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
    }

  } catch (error) {
    console.error('DocuSign OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
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

    // Get user info following the SDK pattern
    const userInfo = await getUserInfo(oAuthToken.access_token);

    // Set base path for the default account
    const defaultAccount = userInfo.accounts.find(acc => acc.is_default) || userInfo.accounts[0];
    
    if (!defaultAccount) {
      throw new Error('No DocuSign account found for user');
    }

    // Store token information in variables for use within this function
    const expiresAt = Date.now() + (oAuthToken.expires_in * 1000);
    docusignTokenData = {
      access_token: oAuthToken.access_token,
      refresh_token: oAuthToken.refresh_token,
      account_id: defaultAccount.account_id,
      base_uri: defaultAccount.base_uri,
      expires_at: expiresAt,
      user_info: userInfo
    };

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
        userInfo: {
          sub: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          accounts: userInfo.accounts
        },
        apiConfig: {
          accountId: defaultAccount.account_id,
          basePath: defaultAccount.base_uri + '/restapi',
          baseUri: defaultAccount.base_uri
        },
        message: 'Token acquired successfully. Data stored in function variables.',
        tokenData: docusignTokenData
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Token exchange error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Token exchange failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
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
        message: 'Token refreshed successfully',
        tokenData: docusignTokenData
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
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
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
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

/**
 * Handle status request - get current token status
 */
async function handleStatusRequest(req: Request): Promise<Response> {
  const tokenData = getDocuSignTokenData();
  
  if (!tokenData) {
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'No token data available. Please authenticate first.',
        isAuthenticated: false
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  const expired = isTokenExpired();
  
  return new Response(
    JSON.stringify({
      success: true,
      isAuthenticated: true,
      tokenData: {
        account_id: tokenData.account_id,
        base_uri: tokenData.base_uri,
        expires_at: tokenData.expires_at,
        user_info: tokenData.user_info
      },
      tokenStatus: {
        isExpired: expired,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: Math.max(0, tokenData.expires_at - Date.now()) / 1000
      },
      message: expired ? 'Token is expired' : 'Token is valid'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
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
 * Get current DocuSign token data
 */
function getDocuSignTokenData() {
  return docusignTokenData;
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
        
        return docusignTokenData.access_token;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  return docusignTokenData.access_token;
}
