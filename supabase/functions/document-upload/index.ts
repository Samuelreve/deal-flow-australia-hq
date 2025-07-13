
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { parseMultipartFormData } from "./utils/formParser.ts";
import { authenticateUser } from "./auth/authHandler.ts";
import { StorageHandler } from "./storage/storageHandler.ts";
import { VersionHandler } from "./document/versionHandler.ts";
import { DocumentHandler } from "./document/documentHandler.ts";
import { PermissionHandler } from "./auth/permissionHandler.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Create Supabase clients
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

    // 2. Parse form data
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

    // 4. Authorization: Check permissions
    const permissionHandler = new PermissionHandler(supabaseAdmin);
    await permissionHandler.checkDealParticipation(userId, dealId);
    const userRole = await permissionHandler.getUserRole(userId, dealId);
    await permissionHandler.checkUploadPermission(userRole);
    await permissionHandler.checkDealStatus(dealId);

    // 5. Process document
    const documentHandler = new DocumentHandler(supabaseAdmin);
    const versionHandler = new VersionHandler(supabaseAdmin);
    const storageHandler = new StorageHandler(supabaseAdmin);
    
    // Process based on whether adding version or creating new document
    let logicalDocumentId: string;
    let versionNumber: number;
    let storagePath: string;
    let finalDocumentName = documentName;
    let document;
    let version;

    try {
      if (documentId) {
        // Adding a new version to existing document
        document = await documentHandler.getExistingDocument(documentId, dealId);
        finalDocumentName = document.name;
        versionNumber = await versionHandler.getNextVersionNumber(documentId);
        logicalDocumentId = documentId;
      } else {
        // Creating a new document
        document = await documentHandler.createDocument({
          dealId, 
          name: finalDocumentName, 
          category, 
          userId, 
          fileSize: file.size, 
          fileType: file.type
        });
        logicalDocumentId = document.id;
        versionNumber = 1;
      }

      // Create storage path
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      storagePath = `${dealId}/${logicalDocumentId}/v${versionNumber}-${sanitizedFileName}`;

      // Update document with storage path if new
      if (!documentId) {
        await documentHandler.updateStoragePath(logicalDocumentId, storagePath);
      }

      // Upload file to storage
      await storageHandler.uploadFile('deal-documents', storagePath, file.buffer, file.type);

      // Create version
      version = await versionHandler.createVersion({
        documentId: logicalDocumentId,
        versionNumber,
        storagePath,
        size: file.size,
        type: file.type,
        userId
      });

      // Link document to latest version
      await documentHandler.updateLatestVersion(logicalDocumentId, version.id);

      // Generate signed URL
      const signedUrl = await storageHandler.createSignedUrl('deal-documents', storagePath, 3600);

      // Return success response
      return new Response(
        JSON.stringify({
          document: document,
          version: {
            ...version,
            url: signedUrl
          },
          message: documentId ? 'New version added successfully' : 'Document created successfully'
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      // Clean up if error during processing
      if (storagePath) {
        await storageHandler.deleteFile('deal-documents', storagePath).catch(console.error);
      }
      
      if (!documentId && logicalDocumentId) {
        await documentHandler.deleteDocument(logicalDocumentId).catch(console.error);
      }
      
      throw error;
    }
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
