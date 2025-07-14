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

    const { envelopeId, documentId, dealId } = await req.json();

    if (!envelopeId || !documentId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: envelopeId, documentId, dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get DocuSign token data from the OAuth function
    console.log('🔍 Calling DocuSign status endpoint...');
    console.log('🔍 SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
    
    const statusUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-sign/status`;
    console.log('🔍 Full status URL:', statusUrl);
    
    const tokenResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status response status:', tokenResponse.status);
    console.log('📊 Status response ok:', tokenResponse.ok);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Status response error:', errorText);
      throw new Error(`DocuSign not authenticated. Status: ${tokenResponse.status}, Error: ${errorText}`);
    }

    const rawResponseText = await tokenResponse.text();
    console.log('🔍 Raw status response text:', rawResponseText);
    
    let tokenData: DocuSignTokenData;
    try {
      tokenData = JSON.parse(rawResponseText);
    } catch (parseError) {
      console.error('❌ Failed to parse status response:', parseError);
      throw new Error(`Failed to parse status response: ${parseError.message}`);
    }
    
    console.log('🔍 Parsed token data:', JSON.stringify(tokenData, null, 2));
    console.log('🔍 Token data access_token:', tokenData.access_token ? 'Present' : 'Missing');
    console.log('🔍 Token data account_id:', tokenData.account_id);
    console.log('🔍 Token data base_uri:', tokenData.base_uri);

    if (!tokenData.account_id || !tokenData.base_uri || !tokenData.access_token) {
      const errorMsg = `Missing DocuSign credentials: account_id=${tokenData.account_id}, base_uri=${tokenData.base_uri}, access_token=${tokenData.access_token ? 'present' : 'missing'}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Download the signed document from DocuSign
    const downloadUrl = `${tokenData.base_uri}/restapi/v2.1/accounts/${tokenData.account_id}/envelopes/${envelopeId}/documents/${documentId}`;
    
    console.log('📥 Downloading signed document from:', downloadUrl);

    const documentResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/pdf'
      }
    });

    if (!documentResponse.ok) {
      throw new Error(`Failed to download signed document: ${documentResponse.status}`);
    }

    const documentBuffer = await documentResponse.arrayBuffer();
    const documentBytes = new Uint8Array(documentBuffer);

    // Get the original document info
    const { data: originalDoc, error: docError } = await supabase
      .from('documents')
      .select('name, category')
      .eq('id', documentId)
      .single();

    if (docError || !originalDoc) {
      throw new Error('Original document not found');
    }

    // Create a unique filename for the signed document
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const signedFileName = `${originalDoc.name.replace('.pdf', '')}_signed_${timestamp}.pdf`;
    const storagePath = `${dealId}/${signedFileName}`;

    // Upload the signed document to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, documentBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload signed document: ${uploadError.message}`);
    }

    // Get signed URL for the uploaded document
    const { data: signedUrlData } = await supabase.storage
      .from('deal_documents')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

    // Create a new document record for the signed document
    const { data: newDoc, error: createError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: signedFileName,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        status: 'signed',
        category: originalDoc.category,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        version: 1
      })
      .select()
      .single();

    if (createError) {
      // Clean up uploaded file if document creation fails
      await supabase.storage
        .from('deal_documents')
        .remove([storagePath]);
      throw new Error(`Failed to create document record: ${createError.message}`);
    }

    // Create a document version record
    const { error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: newDoc.id,
        version_number: 1,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        uploaded_by: newDoc.uploaded_by,
        description: 'Signed document from DocuSign'
      });

    if (versionError) {
      console.error('Failed to create document version:', versionError);
      // Don't fail the whole operation for this
    }

    // Update the original document's status to indicate it has been signed
    await supabase
      .from('documents')
      .update({ status: 'signed' })
      .eq('id', documentId);

    // Update the signature record status
    await supabase
      .from('document_signatures')
      .update({ 
        status: 'completed',
        signed_at: new Date().toISOString()
      })
      .eq('envelope_id', envelopeId);

    console.log('✅ Successfully retrieved and uploaded signed document');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signed document retrieved and uploaded successfully',
        signedDocument: {
          id: newDoc.id,
          name: signedFileName,
          url: signedUrlData?.signedUrl,
          size: documentBytes.length,
          status: 'signed'
        }
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