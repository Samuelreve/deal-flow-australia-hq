
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
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Validates user authorization for a document version
const validateUserAccessToDocument = async (supabase: any, userId: string, versionId: string) => {
  try {
    // Get the document version
    const { data: documentVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', versionId)
      .single();
      
    if (versionError || !documentVersion) {
      console.error('Error fetching document version:', versionError);
      throw new Error('Document version not found');
    }
    
    // Get the document and associated deal ID
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', documentVersion.document_id)
      .single();
      
    if (docError || !document) {
      console.error('Error fetching document:', docError);
      throw new Error('Document not found');
    }
    
    // Check if user is a participant in the deal
    const { data: participant, error: partError } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
      
    if (partError || !participant) {
      console.error('Error checking deal participation:', partError);
      throw new Error('You are not authorized to access this document');
    }
    
    return { 
      authorized: true,
      dealId: document.deal_id,
      participantRole: participant.role
    };
  } catch (error) {
    console.error('Error in validateUserAccessToDocument:', error);
    throw error;
  }
};

// Check if a user can revoke a specific share link
const validateUserCanRevokeLink = async (supabase: any, userId: string, linkId: string) => {
  try {
    // Get the share link details
    const { data: shareLink, error: linkError } = await supabase
      .from('secure_share_links')
      .select('*')
      .eq('id', linkId)
      .single();
      
    if (linkError || !shareLink) {
      console.error('Error fetching share link:', linkError);
      throw new Error('Share link not found');
    }
    
    // Get document version and document info
    const { data: documentVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', shareLink.document_version_id)
      .single();
      
    if (versionError || !documentVersion) {
      console.error('Error fetching document version:', versionError);
      throw new Error('Document version not found');
    }
    
    // Get the deal ID for this document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', documentVersion.document_id)
      .single();
      
    if (docError || !document) {
      console.error('Error fetching document:', docError);
      throw new Error('Document not found');
    }
    
    // Get user's role in the deal
    const { data: participant, error: partError } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
      
    if (partError || !participant) {
      console.error('Error checking deal participation:', partError);
      throw new Error('You are not authorized for this operation');
    }
    
    // Check if user has permission to revoke the link
    // Users can revoke: their own links, OR any link if they are an admin
    const canRevoke = 
      shareLink.shared_by_user_id === userId || 
      participant.role === 'admin';
      
    if (!canRevoke) {
      throw new Error('You do not have permission to revoke this share link');
    }
    
    return {
      authorized: true,
      linkId: linkId,
      shareLink: shareLink
    };
  } catch (error) {
    console.error('Error in validateUserCanRevokeLink:', error);
    throw error;
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
        accessInfo = await validateUserAccessToDocument(supabase, userId, versionId);
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
    else if (req.method === 'POST') {
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
