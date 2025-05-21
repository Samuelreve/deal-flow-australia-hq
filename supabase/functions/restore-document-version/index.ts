
// Edge Function to restore a document version (make it the latest)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders, 
      status: 204 
    });
  }
  
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { versionId, documentId, dealId, userId } = await req.json();
    
    if (!versionId || !documentId || !dealId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // 1. Get the version to restore
    const { data: versionToRestore, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .eq('document_id', documentId)
      .single();
      
    if (versionError || !versionToRestore) {
      throw new Error('Version not found');
    }

    // 2. Get the document to verify access
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('deal_id', dealId)
      .single();
      
    if (documentError || !document) {
      throw new Error('Document not found');
    }

    // 3. Verify user has permission to modify this document
    const { data: participant, error: participantError } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();
      
    if (participantError || !participant) {
      throw new Error('User is not a participant in this deal');
    }

    // 4. Get the next version number
    const { data: versions, error: versionsError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);
      
    if (versionsError) {
      throw new Error('Failed to get latest version number');
    }

    const nextVersionNumber = versions && versions.length > 0 
      ? versions[0].version_number + 1 
      : 1;

    // 5. Create a copy of the file in storage
    // First, we need to get the file content
    let originalFilePath = versionToRestore.storage_path;
    const dealBucket = 'deal-documents'; // Replace with your bucket name
    
    // Download the file content
    const { data: fileData, error: fileError } = await supabase.storage
      .from(dealBucket)
      .download(`${dealId}/${originalFilePath}`);
      
    if (fileError || !fileData) {
      throw new Error('Failed to access file content');
    }

    // Generate a new storage path
    const fileExtension = originalFilePath.split('.').pop();
    const newFileName = `v${nextVersionNumber}_${Date.now()}.${fileExtension}`;
    const newFilePath = `documents/${documentId}/${newFileName}`;
    
    // Upload the file to the new path
    const { error: uploadError } = await supabase.storage
      .from(dealBucket)
      .upload(`${dealId}/${newFilePath}`, fileData, {
        contentType: versionToRestore.type,
        upsert: false
      });
      
    if (uploadError) {
      throw new Error(`Failed to upload restored file: ${uploadError.message}`);
    }

    // 6. Create a new version record
    const { data: newVersion, error: insertError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersionNumber,
        storage_path: newFilePath,
        size: versionToRestore.size,
        type: versionToRestore.type,
        uploaded_by: userId,
        description: `Restored from version ${versionToRestore.version_number}`
      })
      .select()
      .single();
      
    if (insertError || !newVersion) {
      throw new Error('Failed to create restored version');
    }

    // 7. Update the document to point to the new version as latest
    const { error: updateDocError } = await supabase
      .from('documents')
      .update({
        latest_version_id: newVersion.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
      
    if (updateDocError) {
      throw new Error('Failed to update document');
    }

    // 8. Generate a signed URL for the new version
    const { data: signedUrlData } = await supabase.storage
      .from(dealBucket)
      .createSignedUrl(`${dealId}/${newFilePath}`, 60 * 60); // 1 hour expiry
    
    // 9. Format the response
    const response = {
      id: newVersion.id,
      documentId: newVersion.document_id,
      versionNumber: newVersion.version_number,
      url: signedUrlData?.signedUrl || '',
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
