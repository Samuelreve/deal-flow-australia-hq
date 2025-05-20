
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { verifyAuth } from '../_shared/auth.ts';
import { sendEmail, generateShareLinkEmail } from '../_shared/email.ts';

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
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
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
    
    if (versionError) {
      console.error('Error fetching document version:', versionError);
      throw new Error('Document version not found');
    }
    
    if (!version) {
      throw new Error('Document version does not exist');
    }
    
    // Get the document and associated deal
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id, name')
      .eq('id', version.document_id)
      .single();
    
    if (docError) {
      console.error('Error fetching document:', docError);
      throw new Error('Document not found');
    }
    
    if (!document) {
      throw new Error('Document does not exist');
    }
    
    // Check if the user is a participant in the deal
    const { count, error: participantError } = await supabase
      .from('deal_participants')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId);
    
    if (participantError) {
      console.error('Error checking participation:', participantError);
      throw new Error('Failed to verify deal participation');
    }
    
    if (count === 0) {
      throw new Error('Authorization denied: You are not a participant in this deal');
    }
    
    // User is a participant in the deal
    return {
      authorized: true,
      document: document
    };
  } catch (error) {
    console.error('Error in canUserShareDocument:', error);
    throw error;
  }
};

// Function to validate email addresses
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate the request input
const validateInput = (requestData: any) => {
  if (!requestData.document_version_id) {
    throw new Error('Missing required field: document_version_id');
  }
  
  // Validate recipients if provided
  if (requestData.recipients && requestData.recipients.length > 0) {
    const invalidEmails = requestData.recipients.filter((email: string) => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
    }
  }
  
  // Validate expires_at if provided
  if (requestData.expires_at) {
    try {
      const date = new Date(requestData.expires_at);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format for expires_at');
      }
      
      if (date < new Date()) {
        throw new Error('Expiry date must be in the future');
      }
    } catch (error) {
      throw new Error('Invalid date format for expires_at');
    }
  }
  
  return true;
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

    let user;
    try {
      // Extract the token
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
    
    try {
      validateInput(requestData);
    } catch (validationError) {
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let supabase;
    try {
      supabase = getServiceClient();
    } catch (dbConfigError) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    const sharerName = userProfile?.name || 'A Deal Pilot user';
    
    // Check if the user has permission to share this document
    let documentInfo;
    try {
      const result = await canUserShareDocument(supabase, user.id, document_version_id);
      documentInfo = result.document;
    } catch (authError) {
      console.error('Permission error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message || 'You do not have permission to share this document' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get deal information for email
    let dealTitle = 'Untitled Deal';
    let documentName = documentInfo?.name || 'Document';
    
    try {
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('title')
        .eq('id', documentInfo.deal_id)
        .single();
        
      if (!dealError && deal) {
        dealTitle = deal.title;
      }
    } catch (dealError) {
      console.error('Error fetching deal:', dealError);
      // Continue with default title
    }
    
    // Generate a secure token
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
    
    // Send emails if recipients are provided
    const emailResults = [];
    let allEmailsSuccessful = true;
    
    if (recipients && recipients.length > 0) {
      for (const recipientEmail of recipients) {
        try {
          // Generate email content
          const emailHtml = generateShareLinkEmail({
            sharerName,
            dealTitle,
            documentName,
            shareUrl,
            customMessage: custom_message,
            expiresAt: expires_at,
            canDownload: !!can_download
          });
          
          // Send the email
          await sendEmail({
            to: recipientEmail,
            subject: `Secure Document Shared: ${documentName}`,
            html: emailHtml,
            from: "Deal Pilot <notifications@dealpilot.app>"
          });
          
          emailResults.push({
            recipient: recipientEmail,
            success: true
          });
          
        } catch (emailError) {
          console.error(`Error sending email to ${recipientEmail}:`, emailError);
          emailResults.push({
            recipient: recipientEmail,
            success: false,
            error: emailError.message || 'Failed to send email'
          });
          allEmailsSuccessful = false;
        }
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
        email_results: {
          all_successful: allEmailsSuccessful,
          details: emailResults.length > 0 ? emailResults : null
        }
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
