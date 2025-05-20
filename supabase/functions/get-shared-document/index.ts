
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Create a Supabase client
const getServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify the request is GET
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the token from the URL or query params
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing share token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getServiceClient();
    
    // Verify the token and get the share link
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('secure_share_links')
      .select('*')
      .eq('token', token)
      .single();
    
    if (shareLinkError || !shareLink) {
      console.error('Error fetching share link:', shareLinkError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired share link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the link is active and not expired
    const now = new Date();
    if (!shareLink.is_active) {
      return new Response(
        JSON.stringify({ error: 'This share link has been deactivated' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (shareLink.expires_at && new Date(shareLink.expires_at) < now) {
      return new Response(
        JSON.stringify({ error: 'This share link has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if viewing is permitted by this link
    if (!shareLink.can_view) {
      return new Response(
        JSON.stringify({ error: 'This link does not permit viewing the document' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the document version
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select(`
        id, 
        version_number,
        document_id,
        storage_path,
        type,
        uploaded_by,
        uploaded_at,
        description
      `)
      .eq('id', shareLink.document_version_id)
      .single();
    
    if (versionError || !version) {
      console.error('Error fetching document version:', versionError);
      return new Response(
        JSON.stringify({ error: 'Document version not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get document info
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('name, deal_id')
      .eq('id', version.document_id)
      .single();
    
    if (documentError || !document) {
      console.error('Error fetching document:', documentError);
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a temporary signed URL for the file in storage
    const dealId = document.deal_id;
    const storagePath = version.storage_path;
    const signedUrlExpiry = 60 * 60; // 1 hour in seconds
    
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${storagePath}`, signedUrlExpiry);
    
    if (urlError || !urlData?.signedUrl) {
      console.error('Error creating signed URL:', urlError);
      return new Response(
        JSON.stringify({ error: 'Error generating document access URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the document data with signed URL
    const response = {
      success: true,
      data: {
        document_name: document.name,
        version_number: version.version_number,
        description: version.description,
        type: version.type,
        uploaded_at: version.uploaded_at,
        can_download: shareLink.can_download,
        signedUrl: urlData.signedUrl,
        expires_in_seconds: signedUrlExpiry
      }
    };
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-shared-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
