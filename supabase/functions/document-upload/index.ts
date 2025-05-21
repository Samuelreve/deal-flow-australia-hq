import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function to handle multipart form data parsing
async function parseMultipartFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const category = formData.get('category') as string;
  const documentId = formData.get('documentId') as string;
  const documentName = formData.get('documentName') as string;
  const dealId = formData.get('dealId') as string;

  if (!file) {
    throw new Error('Missing file in form data');
  }

  const fileBuffer = new Uint8Array(await file.arrayBuffer());
  
  return {
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: fileBuffer
    },
    category,
    documentId: documentId || undefined,
    documentName: documentName || file.name,
    dealId
  };
}

// Helper function for authentication and basic authorization
async function authenticateUser(request: Request, supabaseClient: any) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

  if (authError || !user) {
    console.error('Auth Error:', authError?.message);
    throw new Error('Unauthorized: Invalid or expired token');
  }

  return user;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    // Create an admin client for operations requiring elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 1. Get authenticated user
    const user = await authenticateUser(req, supabaseAdmin);
    const userId = user.id;

    // 2. Parse form data - updated to get dealId from form data
    const formData = await parseMultipartFormData(req);
    const { file, category, documentId, documentName, dealId } = formData;

    // 3. Validate required fields
    if (!dealId || !file || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (dealId, file, category)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!documentId && !documentName) {
      return new Response(
        JSON.stringify({ error: 'Document name is required for new documents' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 4. Authorization: Check if user is a participant in the deal
    const { count: participantCount, error: participantError } = await supabaseAdmin
      .from('deal_participants')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', dealId)
      .eq('user_id', userId);

    if (participantError) {
      console.error('Error checking user participation:', participantError.message);
      throw new Error('Error verifying deal participation');
    }

    if (participantCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Permission denied: You are not a participant in this deal' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 5. Get user's role for this deal
    const { data: participant, error: roleError } = await supabaseAdmin
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError.message);
      throw new Error('Error verifying user role');
    }

    const userRole = participant.role;

    // 6. Role-Based Access Control: Check if user's role can upload documents
    const authorizedUploaderRoles = ['admin', 'seller', 'lawyer'];
    if (!authorizedUploaderRoles.includes(userRole.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: `Permission denied: Your role (${userRole}) cannot upload documents` }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 7. Check deal status allows document uploads
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('status')
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal status:', dealError.message);
      throw new Error('Error verifying deal status');
    }

    const dealStatus = deal.status;
    const allowedStatusesForUpload = ['draft', 'active', 'pending'];
    
    if (!allowedStatusesForUpload.includes(dealStatus)) {
      return new Response(
        JSON.stringify({ error: `Permission denied: Document uploads are not allowed when the deal status is "${dealStatus}"` }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 8. Determine if adding version or creating new document
    let logicalDocumentId: string;
    let versionNumber: number;
    let storagePath: string;
    let finalDocumentName = documentName;

    // PROCESSING DOCUMENT
    if (documentId) {
      // 8A. Adding a new version to an existing document
      logicalDocumentId = documentId;

      // Verify document exists and belongs to this deal
      const { data: existingDoc, error: existingDocError } = await supabaseAdmin
        .from('documents')
        .select('id, name')
        .eq('id', logicalDocumentId)
        .eq('deal_id', dealId)
        .single();

      if (existingDocError || !existingDoc) {
        console.error('Error verifying document:', existingDocError?.message);
        return new Response(
          JSON.stringify({ error: 'Document not found for this deal' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      finalDocumentName = existingDoc.name;

      // Get highest version number for this document
      const { data: versions, error: versionError } = await supabaseAdmin
        .from('document_versions')
        .select('version_number')
        .eq('document_id', logicalDocumentId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionError) {
        console.error('Error fetching versions:', versionError.message);
        throw new Error('Error fetching document versions');
      }

      versionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
      
      // Create storage path for new version
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      storagePath = `${dealId}/${logicalDocumentId}/v${versionNumber}-${sanitizedFileName}`;

    } else {
      // 8B. Creating a new document and its first version
      // Generate new UUID for document
      const { data: newDocument, error: insertDocError } = await supabaseAdmin
        .from('documents')
        .insert({
          deal_id: dealId,
          name: finalDocumentName,
          category: category,
          uploaded_by: userId,
          size: file.size,
          type: file.type,
          storage_path: '', // Temporary, will update after version is created
          status: 'draft'
        })
        .select()
        .single();

      if (insertDocError) {
        console.error('Error creating document record:', insertDocError.message);
        throw new Error('Failed to create document record');
      }

      logicalDocumentId = newDocument.id;
      versionNumber = 1;
      
      // Create storage path for first version
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      storagePath = `${dealId}/${logicalDocumentId}/v${versionNumber}-${sanitizedFileName}`;
      
      // Update document with storage path
      await supabaseAdmin
        .from('documents')
        .update({ storage_path: storagePath })
        .eq('id', logicalDocumentId);
    }

    // 9. Upload file to Supabase Storage
    const bucketName = 'deal-documents';
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(storagePath, file.buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      
      // Clean up if we created a new document
      if (!documentId) {
        await supabaseAdmin.from('documents').delete().eq('id', logicalDocumentId);
      }
      
      throw new Error('Failed to upload file to storage');
    }

    // 10. Save version metadata
    const { data: newVersion, error: insertVersionError } = await supabaseAdmin
      .from('document_versions')
      .insert({
        document_id: logicalDocumentId,
        version_number: versionNumber,
        storage_path: storagePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: `Version ${versionNumber}`
      })
      .select()
      .single();

    if (insertVersionError) {
      console.error('Error creating version record:', insertVersionError.message);
      
      // Clean up uploaded file
      await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
      
      // Clean up if we created a new document
      if (!documentId) {
        await supabaseAdmin.from('documents').delete().eq('id', logicalDocumentId);
      }
      
      throw new Error('Failed to save document version metadata');
    }

    // 11. Update document to link to latest version
    const { data: updatedDocument, error: updateDocError } = await supabaseAdmin
      .from('documents')
      .update({ latest_version_id: newVersion.id })
      .eq('id', logicalDocumentId)
      .select()
      .single();

    if (updateDocError) {
      console.error('Error updating document with latest version:', updateDocError.message);
      // Non-critical error, continue
    }

    // 12. Generate signed URL for immediate access
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 3600); // 1 hour expiration

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError.message);
      // Non-critical error, continue
    }

    // 13. Return success response with document and version data
    return new Response(
      JSON.stringify({
        document: updatedDocument || { id: logicalDocumentId, name: finalDocumentName, category },
        version: {
          ...newVersion,
          url: signedUrlData?.signedUrl
        },
        message: documentId ? 'New version added successfully' : 'Document created successfully'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in document upload function:', error.message);
    
    // Return appropriate error response
    const errorMessage = error.message || 'An error occurred during document upload';
    const statusCode = 
      errorMessage.includes('Unauthorized') ? 401 :
      errorMessage.includes('Permission denied') ? 403 :
      errorMessage.includes('not found') ? 404 :
      500;
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
