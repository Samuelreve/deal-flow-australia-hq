import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Import DocuSign SDK using default export pattern for Deno
const docusign = await import('npm:docusign-esign@8.2.0');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DocuSignSignRequest {
  documentId: string;
  dealId: string;
  signers: Array<{
    email: string;
    name: string;
    recipientId: string;
  }>;
  signaturePositions?: Array<{
    recipientId: string;
    pageNumber: number;
    x: number;
    y: number;
  }>;
}

// SECURITY: Secure function to get DocuSign tokens for a user
async function getDocuSignAccessToken(userId: string): Promise<{ access_token: string; base_uri: string; account_id: string }> {
  console.log('🔐 Getting DocuSign access token for user:', userId);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Audit log token access
  await supabase.from('token_access_audit').insert({
    user_id: userId,
    action: 'docusign_token_access',
    ip_address: '127.0.0.1', // Edge function context
    user_agent: 'docusign-sign-function'
  });

  // Get user token using secure function (service role only)
  const { data: tokenData, error: tokenError } = await supabase.rpc('get_docusign_token_for_service', {
    p_user_id: userId
  });

  if (tokenError || !tokenData) {
    console.log('No valid DocuSign token found for user, falling back to JWT');
    return await getJWTAccessToken();
  }

  // Check if token is still valid
  if (new Date(tokenData.expires_at) > new Date()) {
    console.log('Using existing OAuth token');
    return {
      access_token: tokenData.access_token,
      base_uri: tokenData.base_uri,
      account_id: tokenData.account_id
    };
  }

  // Token expired, try to refresh if we have refresh token
  if (tokenData.refresh_token) {
    console.log('Token expired, attempting refresh...');
    const refreshed = await refreshOAuthToken(tokenData.refresh_token, userId);
    if (refreshed) {
      return await getDocuSignAccessToken(userId); // Retry after refresh
    }
  }

  // Fallback to JWT if refresh failed
  console.log('Token refresh failed, falling back to JWT');
  return await getJWTAccessToken();
}

// JWT fallback for system-level signing
async function getJWTAccessToken(): Promise<{ access_token: string; base_uri: string; account_id: string }> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
  const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');

  console.log('🔍 DocuSign Environment Variables Check:');
  console.log('DOCUSIGN_INTEGRATION_KEY:', integrationKey ? 'SET' : 'MISSING');
  console.log('DOCUSIGN_USER_ID:', userId ? 'SET' : 'MISSING');
  console.log('DOCUSIGN_PRIVATE_KEY:', privateKey ? 'SET (length: ' + (privateKey?.length || 0) + ')' : 'MISSING');
  console.log('DOCUSIGN_ACCOUNT_ID:', accountId ? 'SET' : 'MISSING');

  if (!integrationKey || !userId || !privateKey || !accountId) {
    const missingVars = [];
    if (!integrationKey) missingVars.push('DOCUSIGN_INTEGRATION_KEY');
    if (!userId) missingVars.push('DOCUSIGN_USER_ID');
    if (!privateKey) missingVars.push('DOCUSIGN_PRIVATE_KEY');
    if (!accountId) missingVars.push('DOCUSIGN_ACCOUNT_ID');
    
    const debugInfo = {
      integrationKey: integrationKey ? 'SET' : 'MISSING',
      userId: userId ? 'SET' : 'MISSING', 
      privateKey: privateKey ? `SET (length: ${privateKey.length})` : 'MISSING',
      accountId: accountId ? 'SET' : 'MISSING',
      missingVars
    };
    
    const errorMsg = `DocuSign JWT not configured. Missing: ${missingVars.join(', ')}. Debug: ${JSON.stringify(debugInfo)}`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  // Use DocuSign SDK for JWT authentication
  const ApiClient = docusign.ApiClient || docusign.default?.ApiClient || docusign.default;
  if (!ApiClient) {
    throw new Error('DocuSign SDK not properly loaded');
  }

  const apiClient = new ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi');
  apiClient.setOAuthBasePath('account-d.docusign.com');

  try {
    const results = await apiClient.requestJWTUserToken(
      integrationKey,
      userId,
      'signature',
      privateKey,
      3600
    );

    if (!results || !results.body || !results.body.access_token) {
      throw new Error('No access token received from DocuSign SDK');
    }

    console.log('✅ Successfully obtained DocuSign JWT access token');
    return {
      access_token: results.body.access_token,
      base_uri: 'https://demo.docusign.net/restapi',
      account_id: accountId
    };
  } catch (error: any) {
    console.error('DocuSign JWT authentication failed:', error);
    throw new Error(`DocuSign JWT authentication failed: ${error.message}`);
  }
}

// Refresh OAuth token
async function refreshOAuthToken(refreshToken: string, userId: string): Promise<boolean> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');

  if (!integrationKey || !clientSecret) {
    console.log('Missing OAuth credentials for refresh');
    return false;
  }

  try {
    const response = await fetch('https://account-d.docusign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: integrationKey,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status, await response.text());
      return false;
    }

    const tokenData = await response.json();
    
    // Update token in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('docusign_tokens').update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || refreshToken,
      expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
      updated_at: new Date().toISOString()
    }).eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: DocuSignSignRequest = await req.json();
    console.log('DocuSign sign request:', {
      documentId: requestData.documentId,
      dealId: requestData.dealId,
      signersCount: requestData.signers?.length || 0,
      hasPositions: !!requestData.signaturePositions
    });

    // Get document from Supabase
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('*')
      .eq('id', requestData.documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Verify user can access this deal
    const { data: participant } = await serviceSupabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', requestData.dealId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      throw new Error('Access denied: Not a participant in this deal');
    }

    // Get DocuSign access token securely
    const { access_token, base_uri, account_id } = await getDocuSignAccessToken(user.id);

    // Download document from Supabase storage
    const { data: fileData, error: downloadError } = await serviceSupabase.storage
      .from('deal_documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      throw new Error('Failed to download document');
    }

    // Convert to base64 for DocuSign
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Doc = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Create envelope using DocuSign SDK
    const ApiClient = docusign.ApiClient || docusign.default?.ApiClient || docusign.default;
    const EnvelopesApi = docusign.EnvelopesApi || docusign.default?.EnvelopesApi;
    
    const apiClient = new ApiClient();
    apiClient.setBasePath(base_uri);
    apiClient.addDefaultHeader('Authorization', `Bearer ${access_token}`);

    const envelopesApi = new EnvelopesApi(apiClient);

    // Create envelope definition
    const envelopeDefinition = {
      emailSubject: `Please sign: ${document.name}`,
      documents: [{
        documentBase64: base64Doc,
        name: document.name,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: requestData.signers.map((signer, index) => ({
          email: signer.email,
          name: signer.name,
          recipientId: signer.recipientId,
          tabs: requestData.signaturePositions ? {
            signHereTabs: requestData.signaturePositions
              .filter(pos => pos.recipientId === signer.recipientId)
              .map(pos => ({
                pageNumber: pos.pageNumber.toString(),
                xPosition: pos.x.toString(),
                yPosition: pos.y.toString()
              }))
          } : {
            signHereTabs: [{
              pageNumber: '1',
              xPosition: '100',
              yPosition: '100'
            }]
          }
        }))
      },
      status: 'sent'
    };

    // Create envelope
    const results = await envelopesApi.createEnvelope(account_id, {
      envelopeDefinition
    });

    if (!results || !results.envelopeId) {
      throw new Error('Failed to create DocuSign envelope');
    }

    // Store signature request in database
    await serviceSupabase.from('document_signatures').insert(
      requestData.signers.map(signer => ({
        document_id: requestData.documentId,
        deal_id: requestData.dealId,
        envelope_id: results.envelopeId,
        signer_email: signer.email,
        signer_role: 'signer',
        status: 'sent'
      }))
    );

    // Get signing URL for the first signer (usually the current user)
    const currentUserSigner = requestData.signers.find(s => s.email === user.email);
    let signingUrl = null;

    if (currentUserSigner) {
      const viewRequest = {
        returnUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-callback`,
        authenticationMethod: 'none'
      };

      try {
        const viewResults = await envelopesApi.createRecipientView(
          account_id,
          results.envelopeId,
          { recipientViewRequest: viewRequest }
        );
        signingUrl = viewResults.url;
      } catch (error) {
        console.error('Failed to create signing URL:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      envelopeId: results.envelopeId,
      signingUrl,
      message: 'Document sent for signing successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error('DocuSign sign error:', error);
    
    // Check if it's a consent required error
    if (error.message?.includes('consent_required')) {
      const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth-callback`;
      const consentUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${Deno.env.get('DOCUSIGN_INTEGRATION_KEY')}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
      
      return new Response(JSON.stringify({
        success: false,
        requiresConsent: true,
        consentUrl,
        error: 'DocuSign consent required'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to initiate DocuSign signing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});