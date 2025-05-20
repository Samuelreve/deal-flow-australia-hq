
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { verifyAuth } from '../_shared/auth.ts';
import { getSupabaseAdmin } from '../_shared/rbac.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

// Function to check if user can manage a share link
const canUserManageShareLink = async (
  supabase: any,
  userId: string,
  linkId: string
) => {
  try {
    // First, get the share link details
    const { data: link, error: linkError } = await supabase
      .from('secure_share_links')
      .select('id, document_version_id, shared_by_user_id')
      .eq('id', linkId)
      .single();
    
    if (linkError || !link) {
      console.error('Error fetching share link:', linkError);
      return false;
    }
    
    // Check if user is the one who shared the link
    if (link.shared_by_user_id === userId) {
      return true;
    }
    
    // Get the document version and associated document
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', link.document_version_id)
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
    
    // Check user's role in the deal
    const { data: participant, error: participantError } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
    
    if (participantError || !participant) {
      console.error('Error checking participation or user is not a participant:', participantError);
      return false;
    }
    
    // Admin or seller in the deal can manage any link
    return ['admin', 'seller'].includes(participant.role.toLowerCase());
    
  } catch (error) {
    console.error('Error in canUserManageShareLink:', error);
    return false;
  }
};

// Get share links for a document version
const getShareLinks = async (req: Request, userId: string) => {
  const url = new URL(req.url);
  const versionId = url.searchParams.get('versionId');
  
  if (!versionId) {
    return new Response(
      JSON.stringify({ error: 'Missing document version ID' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const supabase = getSupabaseAdmin();
  
  // Check if the user has permission to view share links for this document version
  // Get the document version details
  const { data: version, error: versionError } = await supabase
    .from('document_versions')
    .select('document_id')
    .eq('id', versionId)
    .single();
  
  if (versionError || !version) {
    return new Response(
      JSON.stringify({ error: 'Document version not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Get the document and associated deal
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('deal_id')
    .eq('id', version.document_id)
    .single();
  
  if (docError || !document) {
    return new Response(
      JSON.stringify({ error: 'Document not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check if the user is a participant in the deal
  const { count, error: participantError } = await supabase
    .from('deal_participants')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', document.deal_id)
    .eq('user_id', userId);
  
  if (participantError || count === 0) {
    return new Response(
      JSON.stringify({ error: 'You do not have permission to view share links for this document' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Get all share links for this document version
  const { data: links, error: linksError } = await supabase
    .from('secure_share_links')
    .select('*')
    .eq('document_version_id', versionId)
    .order('created_at', { ascending: false });
  
  if (linksError) {
    console.error('Error fetching share links:', linksError);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch share links' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Calculate status for each link
  const linksWithStatus = links.map(link => {
    let status = 'active';
    
    if (!link.is_active) {
      status = 'revoked';
    } else if (link.expires_at && new Date(link.expires_at) < new Date()) {
      status = 'expired';
    }
    
    // Create share URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
    const shareUrl = `${baseUrl}/share/${link.token}`;
    
    return {
      ...link,
      status,
      share_url: shareUrl
    };
  });
  
  return new Response(
    JSON.stringify({ success: true, links: linksWithStatus }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
};

// Deactivate a share link
const deactivateShareLink = async (req: Request, userId: string) => {
  try {
    const { linkId } = await req.json();
    
    if (!linkId) {
      return new Response(
        JSON.stringify({ error: 'Missing link ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getSupabaseAdmin();
    
    // Check if the user has permission to manage this share link
    const canManage = await canUserManageShareLink(supabase, userId, linkId);
    if (!canManage) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to revoke this share link' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Deactivate the share link
    const { data, error } = await supabase
      .from('secure_share_links')
      .update({ is_active: false })
      .eq('id', linkId)
      .select()
      .single();
    
    if (error) {
      console.error('Error deactivating share link:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to revoke share link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Share link revoked successfully',
        link: data
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in deactivateShareLink:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    
    // Handle different request types
    if (req.method === 'GET') {
      return getShareLinks(req, user.id);
    } else if (req.method === 'POST' || req.method === 'PATCH') {
      return deactivateShareLink(req, user.id);
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in manage-share-links function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
