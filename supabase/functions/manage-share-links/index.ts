
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    // Verify JWT token in the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getServiceClient();
    
    // Get user ID from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = user.id;

    // Check the method to determine operation
    if (req.method === 'GET') {
      // Parse request body for versionId - we moved it from query params to body
      const { versionId } = await req.json();
      
      if (!versionId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing versionId in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify user has access to this version
      const { data: documentVersion, error: versionError } = await supabase
        .from('document_versions')
        .select('document_id')
        .eq('id', versionId)
        .single();
        
      if (versionError || !documentVersion) {
        return new Response(
          JSON.stringify({ success: false, error: 'Document version not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the deal ID for this document to verify permissions
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('deal_id')
        .eq('id', documentVersion.document_id)
        .single();
        
      if (docError || !document) {
        return new Response(
          JSON.stringify({ success: false, error: 'Document not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify user is a participant in the deal
      const { data: participant, error: partError } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', document.deal_id)
        .eq('user_id', userId)
        .single();
        
      if (partError || !participant) {
        return new Response(
          JSON.stringify({ success: false, error: 'You are not authorized to access this document' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch share links for this document version
      let query = supabase.from('secure_share_links')
        .select('*')
        .eq('document_version_id', versionId);
        
      // Filter based on user role - admins can see all, others see only their links
      if (participant.role !== 'admin') {
        query = query.eq('shared_by_user_id', userId);
      }
      
      const { data: shareLinks, error: linksError } = await query;
      
      if (linksError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch share links' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Process each link to add formatted status and URL
      const baseUrl = Deno.env.get('PUBLIC_URL') || 'https://app.example.com';
      
      const processedLinks = shareLinks.map(link => {
        const now = new Date();
        const expiresAt = link.expires_at ? new Date(link.expires_at) : null;
        
        let status: 'active' | 'expired' | 'revoked' = 'active';
        
        if (!link.is_active) {
          status = 'revoked';
        } else if (expiresAt && expiresAt < now) {
          status = 'expired';
        }
        
        return {
          ...link,
          status,
          share_url: `${baseUrl}/share/${link.token}`
        };
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          links: processedLinks 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (req.method === 'POST') {
      // Handle revocation of share links
      const { linkId } = await req.json();
      
      if (!linkId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing linkId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify the link exists and user has rights to revoke it
      const { data: shareLink, error: linkError } = await supabase
        .from('secure_share_links')
        .select('*')
        .eq('id', linkId)
        .single();
        
      if (linkError || !shareLink) {
        return new Response(
          JSON.stringify({ success: false, error: 'Share link not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get document version and document info
      const { data: documentVersion, error: versionError } = await supabase
        .from('document_versions')
        .select('document_id')
        .eq('id', shareLink.document_version_id)
        .single();
        
      if (versionError || !documentVersion) {
        return new Response(
          JSON.stringify({ success: false, error: 'Document version not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the deal ID for this document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('deal_id')
        .eq('id', documentVersion.document_id)
        .single();
        
      if (docError || !document) {
        return new Response(
          JSON.stringify({ success: false, error: 'Document not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get user's role in the deal
      const { data: participant, error: partError } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', document.deal_id)
        .eq('user_id', userId)
        .single();
        
      if (partError || !participant) {
        return new Response(
          JSON.stringify({ success: false, error: 'You are not authorized for this operation' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if user has permission to revoke the link
      // Users can revoke: their own links, OR any link if they are an admin
      const canRevoke = 
        shareLink.shared_by_user_id === userId || 
        participant.role === 'admin';
        
      if (!canRevoke) {
        return new Response(
          JSON.stringify({ success: false, error: 'You do not have permission to revoke this share link' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Revoke the link by setting is_active to false
      const { data: updatedLink, error: updateError } = await supabase
        .from('secure_share_links')
        .update({ is_active: false })
        .eq('id', linkId)
        .select()
        .single();
        
      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to revoke share link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Share link revoked successfully',
          link: updatedLink
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
