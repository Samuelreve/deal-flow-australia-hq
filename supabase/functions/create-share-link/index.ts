
import { corsHeaders } from '../_shared/cors.ts';
import { verifyAuth } from '../_shared/auth.ts';
import { getServiceClient, validateUserAccessToVersion } from '../_shared/document-sharing/auth.ts';
import { generateToken } from '../_shared/document-sharing/token.ts';
import { validateShareLinkOptions, isValidEmail } from '../_shared/document-sharing/validation.ts';
import { sendShareLinkEmails } from '../_shared/document-sharing/email.ts';
import { ShareLinkOptions } from '../_shared/document-sharing/types.ts';

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

    // Get and verify the user's JWT
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and verify token
    let user;
    try {
      const token = authorization.replace('Bearer ', '');
      user = await verifyAuth(token);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed: ' + (authError.message || 'Invalid token') }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { 
      document_version_id, 
      expires_at, 
      can_download,
      recipients = [],
      custom_message = "" 
    } = requestData;
    
    // Validate input
    if (!document_version_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: document_version_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate other inputs
    const shareOptions: ShareLinkOptions = {
      expires_at: expires_at || null,
      can_download: !!can_download,
      recipients,
      custom_message
    };
    
    const validation = validateShareLinkOptions(shareOptions);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    let supabase;
    try {
      supabase = getServiceClient();
    } catch (dbConfigError) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check authorization to share document
    let accessResult;
    try {
      accessResult = await validateUserAccessToVersion(supabase, user.id, document_version_id);
    } catch (authError) {
      console.error('Permission error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message || 'You do not have permission to share this document' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user's profile information for email
    let userProfile = { name: 'A Deal Pilot user' };
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
        
      if (!profileError && profile) {
        userProfile = profile;
      }
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Continue with default name
    }
    
    // Get document name
    const documentName = accessResult.documentInfo?.name || 'Document';
    const dealTitle = accessResult.dealInfo?.title || 'Untitled Deal';
    
    // Generate token for the share link
    const shareToken = generateToken();
    
    // Create the share record
    let shareData;
    try {
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
        throw new Error('Failed to create share link in database');
      }
      
      shareData = data;
    } catch (dbError) {
      return new Response(
        JSON.stringify({ error: 'Database error: ' + (dbError.message || 'Failed to create share link') }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Build the share URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    
    // Add the share URL to the response data
    shareData.share_url = shareUrl;
    
    // Send emails if recipients are provided
    let emailResults = { all_successful: true, details: [] };
    
    if (recipients && recipients.length > 0) {
      try {
        emailResults = await sendShareLinkEmails(
          { ...shareData, share_url: shareUrl },
          accessResult.documentInfo,
          accessResult.dealInfo,
          userProfile,
          recipients,
          custom_message
        );
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        emailResults = {
          all_successful: false,
          details: recipients.map(recipient => ({
            recipient,
            success: false,
            error: 'Email sending service unavailable'
          }))
        };
      }
    }
    
    // Return the share link with email sending results
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          ...shareData,
          share_url: shareUrl
        },
        email_results: emailResults
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-share-link function:', error);
    
    // Determine appropriate error status code
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      statusCode = 401;
      errorMessage = error.message;
    } else if (error.message.includes('permission') || error.message.includes('Authorization')) {
      statusCode = 403;
      errorMessage = error.message;
    } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('Missing') || error.message.includes('Invalid')) {
      statusCode = 400;
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
