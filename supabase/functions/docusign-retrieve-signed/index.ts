import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DocuSignTokenData {
  access_token: string;
  account_id: string;
  base_uri: string;
}

serve(async (req: Request) => {
  console.log('=== DocuSign Retrieve Signed Function Started ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dealId, userRole } = await req.json();

    if (!dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Looking for signed documents in signed_document bucket for deal:', dealId);

    // List files in the signed_document bucket for this deal
    const { data: files, error: listError } = await supabase.storage
      .from('signed_document')
      .list(dealId);

    if (listError) {
      console.error('❌ Error listing signed documents:', listError);
      throw new Error('Failed to list signed documents');
    }

    if (!files || files.length === 0) {
      console.log('📄 No signed documents found for deal:', dealId);
      return new Response(
        JSON.stringify({ message: 'No signed documents available yet' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📄 Found signed documents:', files.map(f => f.name));

    const processedDocuments = [];

    // Process each signed document
    for (const file of files) {
      try {
        const signedDocPath = `${dealId}/${file.name}`;
        
        // Download the file from signed_document bucket
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('signed_document')
          .download(signedDocPath);

        if (downloadError || !fileData) {
          console.error('❌ Error downloading file:', file.name, downloadError);
          continue;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const documentBytes = new Uint8Array(arrayBuffer);

        // Create new path in deal_documents bucket
        const newStoragePath = `${dealId}/${file.name}`;

        // Upload to deal_documents bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('deal_documents')
          .upload(newStoragePath, documentBytes, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.error('❌ Error uploading to deal_documents:', uploadError);
          continue;
        }

        // Get signed URL for download
        const { data: signedUrlData } = await supabase.storage
          .from('deal_documents')
          .createSignedUrl(newStoragePath, 60 * 60 * 24); // 24 hours

        // Create document record
        const { data: newDoc, error: createError } = await supabase
          .from('documents')
          .insert({
            deal_id: dealId,
            name: file.name,
            storage_path: newStoragePath,
            size: documentBytes.length,
            type: 'application/pdf',
            status: 'signed',
            category: 'signed_contract',
            uploaded_by: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
            version: 1
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating document record:', createError);
          continue;
        }

        // Create document version record
        await supabase
          .from('document_versions')
          .insert({
            document_id: newDoc.id,
            version_number: 1,
            storage_path: newStoragePath,
            size: documentBytes.length,
            type: 'application/pdf',
            uploaded_by: newDoc.uploaded_by,
            description: 'Signed document from DocuSign'
          });

        // Remove from signed_document bucket after successful processing
        await supabase.storage
          .from('signed_document')
          .remove([signedDocPath]);

        processedDocuments.push({
          id: newDoc.id,
          name: file.name,
          downloadUrl: signedUrlData?.signedUrl,
          size: documentBytes.length
        });

        console.log('✅ Successfully processed signed document:', file.name);

      } catch (error) {
        console.error('❌ Error processing file:', file.name, error);
        continue;
      }
    }

    console.log('✅ Successfully processed signed documents');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedDocuments.length} signed document(s) processed and added to Documents tab`,
        processedDocuments
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('DocuSign retrieve signed document error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to retrieve signed document from DocuSign'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});