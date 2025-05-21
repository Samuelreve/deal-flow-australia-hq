
// Edge Function to restore a document version (make it the latest)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders, handleCorsRequest } from "./utils/cors.ts";
import { validateRequest, verifyUserPermission } from "./utils/validation.ts";
import { 
  getVersionToRestore, 
  getDocument, 
  getNextVersionNumber, 
  createNewVersionRecord,
  updateDocumentLatestVersion
} from "./services/versionService.ts";
import {
  generateNewFilePath,
  downloadFile,
  uploadFile,
  createSignedUrl
} from "./services/storageService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse and validate request body
    const requestBody = await req.json();
    const { versionId, documentId, dealId, userId } = validateRequest(requestBody);

    // Verify access permissions
    await verifyUserPermission(supabase, dealId, userId);
    
    // Get the version to restore and verify related document
    const versionToRestore = await getVersionToRestore(supabase, versionId, documentId);
    await getDocument(supabase, documentId, dealId);
    
    // Get next version number
    const nextVersionNumber = await getNextVersionNumber(supabase, documentId);
    
    // Define storage parameters
    const dealBucket = 'deal-documents';
    const originalFilePath = versionToRestore.storage_path;
    
    // Download the file content
    const fileData = await downloadFile(supabase, dealBucket, dealId, originalFilePath);
    
    // Generate new storage path and upload file
    const newFilePath = generateNewFilePath(originalFilePath, documentId, nextVersionNumber);
    await uploadFile(supabase, dealBucket, dealId, newFilePath, fileData, versionToRestore.type);
    
    // Create new version record
    const newVersion = await createNewVersionRecord(
      supabase, 
      documentId, 
      nextVersionNumber, 
      newFilePath, 
      userId, 
      versionToRestore
    );
    
    // Update document to point to the new version as latest
    await updateDocumentLatestVersion(supabase, documentId, newVersion.id);
    
    // Generate a signed URL for the new version
    const signedUrl = await createSignedUrl(supabase, dealBucket, dealId, newFilePath);
    
    // Format the response
    const response = {
      id: newVersion.id,
      documentId: newVersion.document_id,
      versionNumber: newVersion.version_number,
      url: signedUrl,
      uploadedBy: newVersion.uploaded_by,
      uploadedAt: newVersion.uploaded_at,
      size: newVersion.size,
      type: newVersion.type,
      description: newVersion.description,
      isRestored: true
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error restoring document version:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while restoring the document version' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
