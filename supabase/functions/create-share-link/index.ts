
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { verifyAuth } from '../_shared/auth.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Generate a random token
const generateToken = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Create a Supabase client
const getServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
};

const canUserShareDocument = async (
  supabase: any,
  userId: string, 
  versionId: string
) => {
  try {
    // Get the document version and associated document
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', versionId)
      .single();
    
    if (versionError || !version) {
      console.error('Error fetching document version:', versionError);
      return false;
    }
    
    // Get the document and associated deal
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', version.document_id)
      .single();
    
    if (docError || !document) {
      console.error('Error fetching document:', docError);
      return false;
    }
    
    // Check if the user is a participant in the deal
    const { count, error: participantError } = await supabase
      .from('deal_participants')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId);
    
    if (participantError || count === 0) {
      console.error('Error checking participation or user is not a participant:', participantError);
      return false;
    }
    
    // User is a participant in the deal
    return true;
  } catch (error) {
    console.error('Error in canUserShareDocument:', error);
    return false;
  }
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
    // Verify the request is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get and verify the user's JWT from the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the token
    const token = authorization.replace('Bearer ', '');
    const user = await verifyAuth(token);
    
    // Parse request body
    const { document_version_id, expires_at, can_download } = await req.json();
    
    if (!document_version_id) {
      return new Response(
        JSON.stringify({ error: 'Missing document version ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getServiceClient();
    
    // Check if the user has permission to share this document
    const canShare = await canUserShareDocument(supabase, user.id, document_version_id);
    if (!canShare) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to share this document' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a secure token
    const shareToken = generateToken();
    
    // Create the share record
    const { data, error } = await supabase
      .from('secure_share_links')
      .insert({
        document_version_id,
        shared_by_user_id: user.id,
        token: shareToken,
        expires_at: expires_at || null,
        can_download: !!can_download,
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating share link:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create share link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the share link
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          ...data,
          share_url: shareUrl
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-share-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
