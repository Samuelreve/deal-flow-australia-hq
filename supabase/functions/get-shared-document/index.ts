
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Create a Supabase admin client with service role
const getServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request body to get the token
    const { token } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getServiceClient();
    
    // Get the share link details
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('secure_share_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)  // Added check for is_active status
      .single();
    
    if (shareLinkError || !shareLink) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid, revoked, or expired link' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the link has expired
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'This link has expired'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the document version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select(`
        id,
        document_id,
        version_number,
        type,
        storage_path,
        size,
        uploaded_at,
        description,
        documents:document_id (
          name,
          category,
          description
        )
      `)
      .eq('id', shareLink.document_version_id)
      .single();
    
    if (versionError || !version) {
      console.error('Error fetching document version:', versionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Document version not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get document details from the joined data
    const document = version.documents;
    delete version.documents;
    
    // Create a signed URL for the document
    // The URL will expire after 60 minutes (3600 seconds)
    const expiresIn = 3600;
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(version.storage_path, expiresIn);
      
    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not generate access to the document' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the document data and signed URL
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          document_name: document.name,
          version_number: version.version_number,
          description: version.description || document.description,
          type: version.type,
          uploaded_at: version.uploaded_at,
          can_download: shareLink.can_download,
          signedUrl: signedUrlData.signedUrl,
          expires_in_seconds: expiresIn
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-shared-document function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
