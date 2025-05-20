
import { corsHeaders } from '../_shared/cors.ts';
import { getServiceClient, validateUserAccessToVersion, validateUserCanRevokeLink } from '../_shared/document-sharing/auth.ts';

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
    
    let supabase;
    try {
      supabase = getServiceClient();
    } catch (dbConfigError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user ID from the token
    let user;
    try {
      const { data, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      
      if (error || !data.user) {
        throw new Error('Invalid authorization token');
      }
      
      user = data.user;
    } catch (authError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed: ' + (authError.message || 'Invalid token') }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = user.id;

    // Check the method to determine operation
    if (req.method === 'GET') {
      return await handleGetShareLinks(req, supabase, userId, corsHeaders);
    } 
    else if (req.method === 'POST') {
      return await handleRevokeShareLink(req, supabase, userId, corsHeaders);
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

// Handler for GET requests to fetch share links
async function handleGetShareLinks(req: Request, supabase: any, userId: string, corsHeaders: Record<string, string>) {
  // Parse request body
  let requestData;
  try {
    requestData = await req.json();
  } catch (parseError) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const { versionId } = requestData;
  
  if (!versionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing versionId in request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify user has access to this version
  let accessInfo;
  try {
    accessInfo = await validateUserAccessToVersion(supabase, userId, versionId);
  } catch (accessError) {
    const statusCode = accessError.message.includes('not found') ? 404 : 403;
    return new Response(
      JSON.stringify({ success: false, error: accessError.message }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch share links for this document version
  try {
    let query = supabase.from('secure_share_links')
      .select('*')
      .eq('document_version_id', versionId);
      
    // Filter based on user role - admins can see all, others see only their links
    if (accessInfo.participantRole !== 'admin') {
      query = query.eq('shared_by_user_id', userId);
    }
    
    const { data: shareLinks, error: linksError } = await query;
    
    if (linksError) {
      throw new Error('Failed to fetch share links');
    }
    
    // Process each link to add formatted status and URL
    const baseUrl = req.headers.get('origin') || 'https://app.example.com';
    
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
  } catch (fetchError) {
    console.error('Error fetching share links:', fetchError);
    return new Response(
      JSON.stringify({ success: false, error: fetchError.message || 'Failed to fetch share links' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Handler for POST requests to revoke share links
async function handleRevokeShareLink(req: Request, supabase: any, userId: string, corsHeaders: Record<string, string>) {
  // Handle revocation of share links
  let requestData;
  try {
    requestData = await req.json();
  } catch (parseError) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const { linkId } = requestData;
  
  if (!linkId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing linkId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Verify the link exists and user has rights to revoke it
  try {
    await validateUserCanRevokeLink(supabase, userId, linkId);
    
    // Revoke the link by setting is_active to false
    const { data: updatedLink, error: updateError } = await supabase
      .from('secure_share_links')
      .update({ is_active: false })
      .eq('id', linkId)
      .select()
      .single();
      
    if (updateError) {
      throw new Error('Failed to revoke share link');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Share link revoked successfully',
        link: updatedLink
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (revokeError) {
    console.error('Error revoking share link:', revokeError);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (revokeError.message.includes('not found')) {
      statusCode = 404;
    } else if (revokeError.message.includes('permission') || revokeError.message.includes('authorized')) {
      statusCode = 403;
    }
    
    return new Response(
      JSON.stringify({ success: false, error: revokeError.message }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
