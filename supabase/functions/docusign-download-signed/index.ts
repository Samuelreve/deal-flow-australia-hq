import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Function to get stored DocuSign access token
async function getStoredAccessToken(): Promise<{ access_token: string; base_uri: string; account_id: string }> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Try to get stored OAuth token from database
  console.log('🔍 Looking for stored DocuSign tokens...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('docusign_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (tokenError) {
    console.error('❌ Error fetching DocuSign tokens:', tokenError);
    throw new Error('Failed to retrieve DocuSign tokens from database');
  }

  if (!tokenData || tokenData.length === 0) {
    console.error('❌ No DocuSign tokens found in database');
    throw new Error('No DocuSign tokens found. Please authenticate with DocuSign first.');
  }

  const token = tokenData[0];
  console.log('✅ Found stored DocuSign token');
  
  // Check if token is expired
  const isExpired = new Date(token.expires_at) <= new Date();
  if (isExpired) {
    console.error('❌ Stored DocuSign token is expired');
    throw new Error('DocuSign token is expired. Please re-authenticate.');
  }

  return {
    access_token: token.access_token,
    base_uri: token.base_uri,
    account_id: token.account_id
  };
}

// Function to download document from DocuSign following the tutorial
async function downloadDocumentFromDocuSign(
  accessToken: string, 
  baseUri: string, 
  accountId: string, 
  envelopeId: string, 
  documentId: string = 'combined'
): Promise<Uint8Array> {
  
  console.log('📥 Downloading document from DocuSign...');
  console.log('🔗 Base URI:', baseUri);
  console.log('🏢 Account ID:', accountId);
  console.log('📋 Envelope ID:', envelopeId);
  console.log('📄 Document ID:', documentId);

  // Step 1: Check envelope status first (as per tutorial best practice)
  const envelopeStatusUrl = `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`;
  
  console.log('🔍 Checking envelope status at:', envelopeStatusUrl);
  
  const statusResponse = await fetch(envelopeStatusUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!statusResponse.ok) {
    const error = await statusResponse.text();
    console.error('❌ Failed to get envelope status:', error);
    throw new Error(`Failed to get envelope status: ${statusResponse.status} ${statusResponse.statusText}`);
  }

  const envelopeStatus = await statusResponse.json();
  console.log('📋 Envelope status:', envelopeStatus.status);
  
  if (envelopeStatus.status !== 'completed') {
    throw new Error(`Envelope is not completed. Current status: ${envelopeStatus.status}`);
  }

  // Step 2: Download the document (following tutorial API structure)
  const downloadUrl = `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}`;
  
  console.log('📥 Downloading from:', downloadUrl);
  
  const downloadResponse = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/pdf', // Specify PDF format
      'Content-Type': 'application/json'
    }
  });

  if (!downloadResponse.ok) {
    const error = await downloadResponse.text();
    console.error('❌ Failed to download document:', error);
    throw new Error(`Failed to download document: ${downloadResponse.status} ${downloadResponse.statusText}`);
  }

  console.log('✅ Document downloaded successfully');
  
  // Convert response to Uint8Array
  const arrayBuffer = await downloadResponse.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

serve(async (req: Request) => {
  console.log('=== DocuSign Download Signed Document Function Started ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { envelopeId, dealId, documentId = 'combined' } = await req.json();

    if (!envelopeId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: envelopeId and dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Processing request for envelope:', envelopeId, 'deal:', dealId);

    // Step 1: Get stored OAuth access token from database
    console.log('🔐 Step 1: Retrieving stored DocuSign access token...');
    const { access_token, base_uri, account_id } = await getStoredAccessToken();
    console.log('✅ Successfully retrieved access token from database');

    // Step 2: Download document from DocuSign
    console.log('📥 Step 2: Downloading document from DocuSign...');
    const documentBytes = await downloadDocumentFromDocuSign(
      access_token,
      base_uri,
      account_id,
      envelopeId,
      documentId
    );

    console.log(`📊 Downloaded document size: ${documentBytes.length} bytes`);

    // Step 3: Get original document name from signature record
    const { data: signature } = await supabase
      .from('document_signatures')
      .select('document_id')
      .eq('envelope_id', envelopeId)
      .single();

    let fileName = 'signed_document.pdf';
    
    if (signature?.document_id) {
      const { data: originalDoc } = await supabase
        .from('documents')
        .select('name')
        .eq('id', signature.document_id)
        .single();
      
      if (originalDoc?.name) {
        fileName = `SIGNED_${originalDoc.name}`;
      }
    }

    // Step 4: Save to Supabase Storage
    console.log('💾 Step 3: Saving to Supabase storage...');
    const storagePath = `${dealId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, documentBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      throw new Error('Failed to save document to storage');
    }

    console.log('✅ Document saved to storage:', storagePath);

    // Step 5: Create document record in database
    const { data: newDoc, error: createError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: fileName,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        status: 'signed',
        category: 'signed_contract',
        uploaded_by: '00000000-0000-0000-0000-000000000000', // System user
        version: 1
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create document record:', createError);
      throw new Error('Failed to create document record');
    }

    // Step 6: Create document version record
    await supabase
      .from('document_versions')
      .insert({
        document_id: newDoc.id,
        version_number: 1,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        uploaded_by: newDoc.uploaded_by,
        description: 'Signed document downloaded from DocuSign'
      });

    // Step 7: Update signature status
    await supabase
      .from('document_signatures')
      .update({ 
        status: 'completed',
        signed_at: new Date().toISOString()
      })
      .eq('envelope_id', envelopeId);

    console.log('✅ Successfully downloaded and processed signed document');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signed document downloaded and added to Documents tab',
        document: {
          id: newDoc.id,
          name: fileName,
          size: documentBytes.length,
          envelope_id: envelopeId
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('DocuSign download error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to download signed document from DocuSign'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});