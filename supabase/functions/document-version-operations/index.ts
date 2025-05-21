
// Edge function to handle document version operations
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { addDocumentVersionTag, removeDocumentVersionTag, addDocumentVersionAnnotation } from "../_shared/document-version/index.ts";
import { getSupabaseAdmin, verifyAuth } from "../_shared/rbac.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
  
  try {
    const requestData = await req.json();
    const { operation, ...operationData } = requestData;
    
    if (!operation) {
      throw new Error('Operation type is required');
    }
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }
    
    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify user token
    const user = await verifyAuth(token);
    const userId = user.id;
    
    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    let result;
    
    // Process based on operation type
    switch (operation) {
      case 'addTag':
        const { versionId: tagVersionId, name, color } = operationData;
        result = await addDocumentVersionTag(supabaseAdmin, tagVersionId, name, color);
        break;
        
      case 'removeTag':
        const { tagId } = operationData;
        result = await removeDocumentVersionTag(supabaseAdmin, tagId);
        break;
        
      case 'addAnnotation':
        const { versionId: annVersionId, content } = operationData;
        result = await addDocumentVersionAnnotation(supabaseAdmin, annVersionId, userId, content);
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in document version operations:", error);
    
    // Handle specific errors with appropriate status codes
    let status = 500;
    if (error.message.includes("Unauthorized")) status = 401;
    else if (error.message.includes("Forbidden") || error.message.includes("permission")) status = 403;
    else if (error.message.includes("not found")) status = 404;
    
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred during operation" 
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
