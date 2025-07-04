
// Edge Function to delete an entire document and all its versions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin, verifyAuth, verifyDealParticipant, checkDealAllowsDocOperations, canDeleteDocument } from "../_shared/rbac.ts";

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
    // Parse request URL to get documentId
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    const documentId = pathParts[pathParts.length - 1];
    
    if (!documentId) {
      throw new Error("Document ID is required");
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
    
    // 2. Get document information to find associated deal
    const supabaseAdmin = getSupabaseAdmin();
    const { data: document, error: documentError } = await supabaseAdmin
      .from('documents')
      .select('deal_id, id')
      .eq('id', documentId)
      .single();
    
    if (documentError || !document) {
      console.error("Document not found:", documentError || "No data returned");
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const dealId = document.deal_id;
    
    // 3. Check user is a participant in this deal
    await verifyDealParticipant(userId, dealId);
    
    // 4. Check if deal status allows document operations
    const dealStatus = await checkDealAllowsDocOperations(dealId);
    if (!dealStatus.allowsDelete) {
      throw new Error(`Document deletion is not allowed when deal status is "${dealStatus.dealStatus}"`);
    }
    
    // 5. Check if user has permission to delete this document
    const hasPermission = await canDeleteDocument(userId, documentId, dealId);
    if (!hasPermission) {
      throw new Error("You don't have permission to delete this document");
    }
    
    // 6. Get all versions to delete from storage
    const { data: versions, error: versionsError } = await supabaseAdmin
      .from('document_versions')
      .select('storage_path')
      .eq('document_id', documentId);
      
    if (versionsError) {
      console.error("Error fetching versions:", versionsError);
      // Continue anyway, will try to delete document
    }
    
    // 7. Delete all version files from storage
    if (versions && versions.length > 0) {
      const storagePaths = versions
        .filter(v => v.storage_path) // Filter out any null paths
        .map(v => `${dealId}/${v.storage_path}`);
        
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from('deal-documents')
          .remove(storagePaths);
          
        if (storageError) {
          console.error("Storage delete error:", storageError);
          // Continue anyway, will still delete database records
        }
      }
    }
    
    // 8. Delete the document from database (will cascade delete versions if set up correctly)
    const { error: deleteDocError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId);
      
    if (deleteDocError) {
      throw new Error(`Failed to delete document: ${deleteDocError.message}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Document and all versions deleted successfully" 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    
    // Handle specific errors with appropriate status codes
    let status = 500;
    if (error.message.includes("Unauthorized")) status = 401;
    else if (error.message.includes("Forbidden") || error.message.includes("permission")) status = 403;
    else if (error.message.includes("not found")) status = 404;
    
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while deleting document" 
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
