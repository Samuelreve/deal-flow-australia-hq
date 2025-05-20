
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
      .select('deal_id, name')
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

// Function to validate email addresses
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    const { 
      document_version_id, 
      expires_at, 
      can_download,
      recipients = [],
      custom_message = "" 
    } = await req.json();
    
    if (!document_version_id) {
      return new Response(
        JSON.stringify({ error: 'Missing document version ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate email addresses if provided
    if (recipients && recipients.length > 0) {
      const invalidEmails = recipients.filter((email: string) => !isValidEmail(email));
      if (invalidEmails.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid email addresses', 
            invalidEmails 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const supabase = getServiceClient();
    
    // Get user's profile information for email
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Continue without user profile (we'll use a generic name)
    }
    
    const sharerName = userProfile?.name || 'A Deal Pilot user';
    
    // Check if the user has permission to share this document
    const canShare = await canUserShareDocument(supabase, user.id, document_version_id);
    if (!canShare) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to share this document' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get document and deal information for email
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', document_version_id)
      .single();
      
    if (versionError) {
      console.error('Error fetching document version:', versionError);
      return new Response(
        JSON.stringify({ error: 'Document version not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('name, deal_id')
      .eq('id', version.document_id)
      .single();
      
    if (docError) {
      console.error('Error fetching document:', docError);
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title')
      .eq('id', document.deal_id)
      .single();
      
    if (dealError) {
      console.error('Error fetching deal:', dealError);
      // Continue without deal info
    }
    
    const dealTitle = deal?.title || 'Untitled Deal';
    const documentName = document.name;
    
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
          const emailResult = await sendEmail({
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
          ...data,
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
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
