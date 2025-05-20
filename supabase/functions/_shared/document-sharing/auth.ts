
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Create a Supabase client
export const getServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Check if a user can access a document version
export const validateUserAccessToVersion = async (
  supabase: any,
  userId: string, 
  versionId: string
): Promise<{ authorized: boolean; documentInfo?: any; dealInfo?: any; participantRole?: string }> => {
  try {
    // Get the document version and associated document
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', versionId)
      .single();
    
    if (versionError || !version) {
      throw new Error('Document version not found');
    }
    
    // Get the document and associated deal
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id, name')
      .eq('id', version.document_id)
      .single();
    
    if (docError || !document) {
      throw new Error('Document not found');
    }
    
    // Check if the user is a participant in the deal
    const { data: participant, error: partError } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', document.deal_id)
      .eq('user_id', userId)
      .single();
    
    if (partError || !participant) {
      throw new Error('Authorization denied: You are not a participant in this deal');
    }
    
    // Get deal information
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title')
      .eq('id', document.deal_id)
      .single();
    
    if (dealError) {
      console.error('Error fetching deal info:', dealError);
    }
    
    return {
      authorized: true,
      documentInfo: document,
      dealInfo: deal || { title: 'Untitled Deal' },
      participantRole: participant.role
    };
  } catch (error) {
    console.error('Error in validateUserAccessToVersion:', error);
    throw error;
  }
};

// Check if user can revoke a share link
export const validateUserCanRevokeLink = async (
  supabase: any, 
  userId: string, 
  linkId: string
): Promise<{ authorized: boolean; linkId: string; shareLink: any }> => {
  try {
    // Get the share link details
    const { data: shareLink, error: linkError } = await supabase
      .from('secure_share_links')
      .select('*')
      .eq('id', linkId)
      .single();
      
    if (linkError || !shareLink) {
      throw new Error('Share link not found');
    }
    
    // Get document version and document info
    const { data: documentVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('document_id')
      .eq('id', shareLink.document_version_id)
      .single();
      
    if (versionError || !documentVersion) {
      throw new Error('Document version not found');
    }
    
    // Get the deal ID for this document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('deal_id')
      .eq('id', documentVersion.document_id)
      .single();
      
    if (docError || !document) {
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
