import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const error = url.searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('DocuSign OAuth error:', error);
      const errorDescription = url.searchParams.get('error_description') || '';
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
              .message { color: #6c757d; margin-bottom: 30px; }
              .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="error">❌ Authorization Failed</div>
            <div class="message">${errorDescription || 'Access was denied or an error occurred.'}</div>
            <a href="#" onclick="window.close()" class="button">Close Window</a>
          </body>
        </html>
      `;
      
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 400
      });
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    console.log('Received authorization code, exchanging for access token...');

    // Get DocuSign credentials from environment
    const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
    
    if (!integrationKey || !clientSecret) {
      throw new Error('DocuSign credentials not configured');
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
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth-callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');

    // Store the tokens securely (you might want to save to database or handle differently)
    // For now, we'll just log the success and show a success page
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DocuSign Authorization Complete</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
            .message { color: #6c757d; margin-bottom: 30px; }
            .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="success">✅ Authorization Successful</div>
          <div class="message">
            DocuSign has been successfully authorized for your account.<br/>
            You can now close this window and try signing documents again.
          </div>
          <a href="#" onclick="window.close()" class="button">Close Window</a>
          <script>
            // Auto-close window after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
            
            // Store a flag in localStorage to indicate successful authorization
            localStorage.setItem('docusign_authorized', 'true');
            
            // Try to communicate with parent window if available
            if (window.opener) {
              window.opener.postMessage({ type: 'DOCUSIGN_AUTH_SUCCESS' }, '*');
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error('DocuSign OAuth callback error:', error);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
            .message { color: #6c757d; margin-bottom: 30px; }
            .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="error">❌ Authorization Error</div>
          <div class="message">${error.message}</div>
          <a href="#" onclick="window.close()" class="button">Close Window</a>
        </body>
      </html>
    `;
    
    return new Response(html, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });
  }
});