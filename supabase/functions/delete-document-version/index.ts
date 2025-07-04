
// Edge Function to delete a specific document version

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin, verifyAuth, verifyDealParticipant, checkDealAllowsDocOperations, canDeleteDocumentVersion } from "../_shared/rbac.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  try {
    // Parse request URL to get versionId
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    const versionId = pathParts[pathParts.length - 1];
    
    if (!versionId) {
      throw new Error("Version ID is required");
    }
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }
    
    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // 1. Authentication: Verify user token
    const user = await verifyAuth(token);
    const userId = user.id;
    
    // 2. Get version information to find associated document and deal
    const supabaseAdmin = getSupabaseAdmin();
    const { data: version, error: versionError } = await supabaseAdmin
      .from('document_versions')
      .select('document_id, storage_path')
      .eq('id', versionId)
      .single();
    
    if (versionError || !version) {
      console.error("Version not found:", versionError || "No data returned");
      return new Response(JSON.stringify({ error: 'Version not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 3. Get document to find associated deal
    const { data: document, error: documentError } = await supabaseAdmin
      .from('documents')
      .select('deal_id')
      .eq('id', version.document_id)
      .single();
    
    if (documentError || !document) {
      console.error("Document not found:", documentError || "No data returned");
      return new Response(JSON.stringify({ error: 'Associated document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const dealId = document.deal_id;
    
    // 4. Check user is a participant in this deal
    await verifyDealParticipant(userId, dealId);
    
    // 5. Check if deal status allows document operations
    const dealStatus = await checkDealAllowsDocOperations(dealId);
    if (!dealStatus.allowsDelete) {
      throw new Error(`Document version deletion is not allowed when deal status is "${dealStatus.dealStatus}"`);
    }
    
    // 6. Check if user has permission to delete this version
    const hasPermission = await canDeleteDocumentVersion(userId, versionId, dealId);
    if (!hasPermission) {
      throw new Error("You don't have permission to delete this document version");
    }
    
    // 7. Delete the version from database
    const { error: deleteVersionError } = await supabaseAdmin
      .from('document_versions')
      .delete()
      .eq('id', versionId);
      
    if (deleteVersionError) {
      throw new Error(`Failed to delete version: ${deleteVersionError.message}`);
    }
    
    // 8. Delete the file from storage
    const storagePath = version.storage_path;
    if (storagePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('deal-documents')
        .remove([`${dealId}/${storagePath}`]);
        
      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Continue anyway, as database record is already deleted
      }
    }
    
    // 9. Check if this was the latest version and update document if needed
    const { data: remainingVersions, error: versionsError } = await supabaseAdmin
      .from('document_versions')
      .select('id')
      .eq('document_id', version.document_id)
      .order('version_number', { ascending: false })
      .limit(1);
    
    if (!versionsError && remainingVersions && remainingVersions.length > 0) {
      // Update document to point to new latest version
      await supabaseAdmin
        .from('documents')
        .update({ latest_version_id: remainingVersions[0].id })
        .eq('id', version.document_id);
    } else {
      // No versions left, set latest_version_id to null
      await supabaseAdmin
        .from('documents')
        .update({ latest_version_id: null })
        .eq('id', version.document_id);
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Document version deleted successfully" 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error deleting document version:", error);
    
    // Handle specific errors with appropriate status codes
    let status = 500;
    if (error.message.includes("Unauthorized")) status = 401;
    else if (error.message.includes("Forbidden") || error.message.includes("permission")) status = 403;
    else if (error.message.includes("not found")) status = 404;
    
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while deleting document version" 
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
