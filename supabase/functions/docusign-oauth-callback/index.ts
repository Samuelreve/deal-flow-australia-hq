import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Contains user_id
    const error = url.searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('DocuSign OAuth error:', error);
      const errorDescription = url.searchParams.get('error_description') || '';
      return renderErrorPage(`Authorization denied: ${errorDescription || error}`);
    }

    if (!code) {
      return renderErrorPage('No authorization code received');
    }

    // Extract user_id from state parameter
    let userId: string | null = null;
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        userId = stateData.user_id;
      } catch {
        console.log('State is not JSON, treating as user_id directly');
        userId = state;
      }
    }

    if (!userId) {
      return renderErrorPage('Missing user identification. Please try connecting again.');
    }

    console.log('Received authorization code for user:', userId);

    // Get DocuSign credentials from environment
    const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!integrationKey || !clientSecret) {
      return renderErrorPage('DocuSign credentials not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return renderErrorPage('Supabase configuration missing');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://account-d.docusign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${integrationKey}:${clientSecret}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${supabaseUrl}/functions/v1/docusign-oauth-callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return renderErrorPage(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Get user info from DocuSign
    const userInfoResponse = await fetch('https://account-d.docusign.com/oauth/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      return renderErrorPage('Failed to get DocuSign user info');
    }

    const userInfo = await userInfoResponse.json();
    const defaultAccount = userInfo.accounts?.find((acc: any) => acc.is_default) || userInfo.accounts?.[0];

    if (!defaultAccount) {
      return renderErrorPage('No DocuSign account found');
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

    // Store tokens in database using service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: upsertError } = await supabase
      .from('docusign_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        account_id: defaultAccount.account_id,
        base_uri: defaultAccount.base_uri,
        expires_at: expiresAt,
        user_info: {
          name: userInfo.name,
          email: userInfo.email,
          sub: userInfo.sub
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return renderErrorPage('Failed to save DocuSign connection');
    }

    console.log('✅ DocuSign tokens stored for user:', userId);

    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DocuSign Connected</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 400px; }
            .success { color: #10b981; font-size: 48px; margin-bottom: 16px; }
            h1 { color: #1f2937; margin: 0 0 12px; font-size: 24px; }
            .message { color: #6b7280; margin-bottom: 24px; line-height: 1.6; }
            .account { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; }
            .account-name { font-weight: 600; color: #374151; }
            .account-email { font-size: 14px; color: #6b7280; }
            .button { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
            .button:hover { background: #059669; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="success">✓</div>
            <h1>DocuSign Connected!</h1>
            <div class="message">Your DocuSign account has been successfully connected. You can now sign documents.</div>
            <div class="account">
              <div class="account-name">${userInfo.name || 'DocuSign User'}</div>
              <div class="account-email">${userInfo.email || ''}</div>
            </div>
            <button class="button" onclick="closeWindow()">Close Window</button>
          </div>
          <script>
            function closeWindow() {
              if (window.opener) {
                window.opener.postMessage({ type: 'DOCUSIGN_AUTH_SUCCESS' }, '*');
              }
              window.close();
            }
            // Auto-close after 5 seconds
            setTimeout(closeWindow, 5000);
          </script>
        </body>
      </html>
    `, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error('DocuSign OAuth callback error:', error);
    return renderErrorPage(error.message || 'An unexpected error occurred');
  }
});

function renderErrorPage(message: string): Response {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connection Failed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; }
          .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 400px; }
          .error { color: #ef4444; font-size: 48px; margin-bottom: 16px; }
          h1 { color: #1f2937; margin: 0 0 12px; font-size: 24px; }
          .message { color: #6b7280; margin-bottom: 24px; line-height: 1.6; }
          .button { background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
          .button:hover { background: #4b5563; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="error">✕</div>
          <h1>Connection Failed</h1>
          <div class="message">${message}</div>
          <button class="button" onclick="window.close()">Close Window</button>
        </div>
      </body>
    </html>
  `, {
    status: 400,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/html' },
  });
}
