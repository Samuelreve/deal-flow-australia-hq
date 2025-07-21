import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== DocuSign Test Function ===');
    
    // Check environment variables
    const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const userId = Deno.env.get('DOCUSIGN_USER_ID');
    const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
    
    const config = {
      hasIntegrationKey: !!integrationKey,
      hasUserId: !!userId,
      hasPrivateKey: !!privateKey,
      hasAccountId: !!accountId,
      hasClientSecret: !!clientSecret,
      integrationKeyPrefix: integrationKey ? integrationKey.substring(0, 8) + '...' : 'Missing',
      userIdPrefix: userId ? userId.substring(0, 8) + '...' : 'Missing',
      accountIdPrefix: accountId ? accountId.substring(0, 8) + '...' : 'Missing'
    };
    
    console.log('DocuSign configuration check:', config);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'DocuSign test function working',
        config,
        allSecretsPresent: config.hasIntegrationKey && config.hasUserId && config.hasPrivateKey && config.hasAccountId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('DocuSign test error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});